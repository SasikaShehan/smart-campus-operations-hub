package com.sliit.paf.smartCampusHub.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigInteger;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.spec.RSAPublicKeySpec;
import java.time.Instant;
import java.util.ArrayList;
import java.util.Base64;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Verifies Firebase ID tokens using Google's public JWK keys.
 * No service account or Firebase Admin SDK required.
 * Uses only Java standard library + jjwt (already in project).
 */
@Service
public class FirebaseTokenVerifier {

    private static final String JWK_URL =
        "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com";

    @Value("${firebase.project-id}")
    private String projectId;

    private final HttpClient httpClient = HttpClient.newHttpClient();

    // Simple in-memory key cache
    private volatile Map<String, PublicKey> keyCache = new HashMap<>();
    private volatile Instant cacheExpiry = Instant.EPOCH;

    /**
     * Verify a Firebase ID token and return its claims (email, name, sub, etc.)
     */
    public Map<String, Object> verifyIdToken(String idToken) throws Exception {
        String[] parts = idToken.split("\\.");
        if (parts.length != 3) {
            throw new Exception("Invalid JWT format");
        }

        // Decode header to get 'kid' — using pure Java Base64 + simple string parsing
        String headerJson = new String(Base64.getUrlDecoder().decode(parts[0]));
        String kid = extractJsonStringValue(headerJson, "kid");
        if (kid == null) {
            throw new Exception("Missing 'kid' in JWT header");
        }

        // Get matching Google public key
        PublicKey publicKey = getPublicKey(kid);

        // Verify JWT signature + expiration using jjwt
        Claims claims = Jwts.parserBuilder()
                .setSigningKey(publicKey)
                .build()
                .parseClaimsJws(idToken)
                .getBody();

        // Validate issuer
        String expectedIssuer = "https://securetoken.google.com/" + projectId;
        if (!expectedIssuer.equals(claims.getIssuer())) {
            throw new Exception("Invalid token issuer: " + claims.getIssuer());
        }

        // Validate audience (jjwt 0.11.x returns String, not Set<String>)
        String audience = claims.getAudience();
        if (audience == null || !audience.contains(projectId)) {
            throw new Exception("Invalid token audience");
        }

        return new HashMap<>(claims);
    }

    private PublicKey getPublicKey(String kid) throws Exception {
        if (Instant.now().isAfter(cacheExpiry)) {
            refreshKeys();
        }
        PublicKey key = keyCache.get(kid);
        if (key == null) {
            refreshKeys(); // retry once in case of key rotation
            key = keyCache.get(kid);
        }
        if (key == null) {
            throw new Exception("No public key found for kid: " + kid);
        }
        return key;
    }

    private void refreshKeys() throws Exception {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(JWK_URL))
                .GET()
                .build();

        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        String body = response.body();

        // Parse JWK set using simple string extraction (no Jackson needed)
        List<Map<String, String>> keys = extractJwkKeys(body);

        Map<String, PublicKey> newCache = new HashMap<>();
        for (Map<String, String> jwk : keys) {
            String keyId = jwk.get("kid");
            String n = jwk.get("n");
            String e = jwk.get("e");
            if (keyId != null && n != null && e != null) {
                newCache.put(keyId, parseRsaPublicKey(n, e));
            }
        }

        this.keyCache = newCache;
        this.cacheExpiry = Instant.now().plusSeconds(3600);
    }

    /**
     * Simple JWK JSON parser — extracts "keys" array from Google's JWK response.
     * Handles the specific format: {"keys":[{"kty":"RSA","alg":"RS256","use":"sig","kid":"...","n":"...","e":"..."},...]}
     */
    private List<Map<String, String>> extractJwkKeys(String json) {
        List<Map<String, String>> result = new ArrayList<>();

        // Find the keys array
        int keysStart = json.indexOf("[");
        int keysEnd = json.lastIndexOf("]");
        if (keysStart < 0 || keysEnd < 0) return result;

        String keysArray = json.substring(keysStart + 1, keysEnd);

        // Split individual key objects by "}," pattern
        // Each key is a JSON object like {"kid":"x","n":"y","e":"z",...}
        int depth = 0;
        int start = -1;
        for (int i = 0; i < keysArray.length(); i++) {
            char c = keysArray.charAt(i);
            if (c == '{') {
                if (depth == 0) start = i;
                depth++;
            } else if (c == '}') {
                depth--;
                if (depth == 0 && start >= 0) {
                    String keyJson = keysArray.substring(start, i + 1);
                    Map<String, String> fields = new HashMap<>();
                    for (String field : new String[]{"kid", "n", "e", "kty", "alg"}) {
                        String val = extractJsonStringValue(keyJson, field);
                        if (val != null) fields.put(field, val);
                    }
                    result.add(fields);
                    start = -1;
                }
            }
        }
        return result;
    }

    /**
     * Extracts a string value from a JSON string by key name.
     * Works for simple flat JSON objects.
     */
    private String extractJsonStringValue(String json, String key) {
        String searchKey = "\"" + key + "\"";
        int keyIdx = json.indexOf(searchKey);
        if (keyIdx < 0) return null;

        int colonIdx = json.indexOf(":", keyIdx + searchKey.length());
        if (colonIdx < 0) return null;

        int quoteStart = json.indexOf("\"", colonIdx + 1);
        if (quoteStart < 0) return null;

        // Find closing quote, skipping escaped quotes
        int quoteEnd = quoteStart + 1;
        while (quoteEnd < json.length()) {
            if (json.charAt(quoteEnd) == '"' && json.charAt(quoteEnd - 1) != '\\') break;
            quoteEnd++;
        }
        if (quoteEnd >= json.length()) return null;

        return json.substring(quoteStart + 1, quoteEnd);
    }

    private PublicKey parseRsaPublicKey(String n, String e) throws Exception {
        byte[] modulusBytes  = Base64.getUrlDecoder().decode(n);
        byte[] exponentBytes = Base64.getUrlDecoder().decode(e);

        RSAPublicKeySpec spec = new RSAPublicKeySpec(
                new BigInteger(1, modulusBytes),
                new BigInteger(1, exponentBytes)
        );
        return KeyFactory.getInstance("RSA").generatePublic(spec);
    }
}

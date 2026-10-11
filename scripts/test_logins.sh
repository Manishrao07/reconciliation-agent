#!/bin/bash
test_login() {
    EMAIL=$1
    echo "Testing $EMAIL..."
    TOKEN=$(curl -s -X POST http://localhost:8000/api/v1/auth/login -d "username=$EMAIL&password=Demo#Pass123" | jq -r .access_token)
    if [ "$TOKEN" != "null" ] && [ -n "$TOKEN" ]; then
        ROLE=$(curl -s -H "Authorization: Bearer $TOKEN" http://localhost:8000/api/v1/auth/me | jq -r .role)
        echo "Success! Role: $ROLE"
    else
        echo "Failed to get token for $EMAIL"
    fi
}

test_login "admin@example.com"
test_login "manager@example.com"
test_login "auditor@example.com"

#!/bin/bash

# IPTV Management Platform - API Testing Script
# Tests all API endpoints to ensure they work correctly

# Configuration
API_BASE_URL=${1:-"https://your-worker.your-subdomain.workers.dev/api"}

echo "🧪 IPTV Management Platform - API Testing"
echo "========================================="
echo "Testing API at: $API_BASE_URL"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test an endpoint
test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    local data=$5
    
    echo -n "Testing $description... "
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/api_response "$API_BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/api_response -X POST -H "Content-Type: application/json" -d "$data" "$API_BASE_URL$endpoint")
    elif [ "$method" = "PUT" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/api_response -X PUT -H "Content-Type: application/json" -d "$data" "$API_BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "%{http_code}" -o /tmp/api_response -X DELETE "$API_BASE_URL$endpoint")
    fi
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected: $expected_status, Got: $response)"
        echo "Response body:"
        cat /tmp/api_response
        echo ""
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
}

# Test 1: Health Check
echo "1. Health Check"
echo "==============="
test_endpoint "GET" "/health" "200" "Health endpoint"
echo ""

# Test 2: Dashboard
echo "2. Dashboard"
echo "============"
test_endpoint "GET" "/dashboard/stats" "200" "Dashboard statistics"
echo ""

# Test 3: Plateformes
echo "3. Plateformes"
echo "=============="
test_endpoint "GET" "/plateformes" "200" "Get all plateformes"
test_endpoint "POST" "/plateformes" "201" "Create plateforme" '{"nom":"Test Platform","description":"Test description","url":"https://test.com","devise":"USD"}'
test_endpoint "GET" "/plateformes/1" "200" "Get plateforme by ID"
test_endpoint "PUT" "/plateformes/1" "200" "Update plateforme" '{"description":"Updated description"}'
echo ""

# Test 4: Clients
echo "4. Clients"
echo "=========="
test_endpoint "GET" "/clients" "200" "Get all clients"
test_endpoint "POST" "/clients" "201" "Create client" '{"nom":"Test","prenom":"Client","telephone":"+213555000000","wilaya":"Alger"}'
test_endpoint "GET" "/clients/1" "200" "Get client by ID"
test_endpoint "PUT" "/clients/1" "200" "Update client" '{"notes":"Updated notes"}'
echo ""

# Test 5: Produits
echo "5. Produits"
echo "==========="
test_endpoint "GET" "/produits" "200" "Get all produits"
test_endpoint "POST" "/produits" "201" "Create produit" '{"id_plateforme":1,"nom":"Test Product","categorie":"IPTV","duree_mois":12,"prix_achat_moyen":100,"marge":50,"stock_actuel":10}'
test_endpoint "GET" "/produits/1" "200" "Get produit by ID"
test_endpoint "PUT" "/produits/1" "200" "Update produit" '{"stock_actuel":15}'
echo ""

# Test 6: Recharges
echo "6. Recharges"
echo "============"
test_endpoint "GET" "/recharges" "200" "Get all recharges"
test_endpoint "POST" "/recharges" "201" "Create recharge" '{"id_plateforme":1,"montant":500,"devise":"USD","statut":"confirme","date_recharge":"2024-02-15T10:00:00Z"}'
test_endpoint "GET" "/recharges/1" "200" "Get recharge by ID"
test_endpoint "PUT" "/recharges/1" "200" "Update recharge" '{"statut":"confirme"}'
echo ""

# Test 7: Ventes
echo "7. Ventes"
echo "========="
test_endpoint "GET" "/ventes" "200" "Get all ventes"
test_endpoint "POST" "/ventes" "201" "Create vente" '{"id_client":1,"id_produit":1,"id_plateforme":1,"quantite":1,"prix_unitaire":150,"date_vente":"2024-02-15T10:00:00Z","methode_paiement":"espece","statut_paiement":"paye"}'
test_endpoint "GET" "/ventes/1" "200" "Get vente by ID"
test_endpoint "PUT" "/ventes/1" "200" "Update vente" '{"statut_paiement":"paye"}'
echo ""

# Test 8: Parametres
echo "8. Parametres"
echo "============="
test_endpoint "GET" "/parametres" "200" "Get parametres"
test_endpoint "PUT" "/parametres" "200" "Update parametres" '{"business":{"nom_entreprise":"Updated Company"}}'
echo ""

# Test 9: Error Handling
echo "9. Error Handling"
echo "================="
test_endpoint "GET" "/nonexistent" "404" "Non-existent endpoint"
test_endpoint "GET" "/plateformes/99999" "404" "Non-existent resource"
test_endpoint "POST" "/plateformes" "400" "Invalid data" '{"invalid":"data"}'
echo ""

# Summary
echo "📊 Test Summary"
echo "==============="
echo -e "Tests passed: ${GREEN}$TESTS_PASSED${NC}"
echo -e "Tests failed: ${RED}$TESTS_FAILED${NC}"
echo "Total tests: $((TESTS_PASSED + TESTS_FAILED))"

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "\n🎉 ${GREEN}All tests passed!${NC} Your API is working correctly."
    exit 0
else
    echo -e "\n⚠️  ${YELLOW}Some tests failed.${NC} Please check the API implementation."
    exit 1
fi

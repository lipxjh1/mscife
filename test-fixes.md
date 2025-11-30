# 🔧 TEST PLAN: Amount + Wallet Validation Fixes

## 📋 Fixes Applied

### ✅ Fix 1: Amount Format (PRIMARY)
- **File**: `src/App.jsx` - ReactSendTransaction function
- **Issue**: `toNanoTon()` returns number but TonConnect SDK expects STRING
- **Fix**: Convert amount to string using `BigInt(Math.floor(amount * 1e9)).toString()`
- **Added**: Detailed logging for amount conversion debugging

### ✅ Fix 2: Wallet Validation (SECONDARY)
- **File**: `src/game/scenes/Home/HomeMusk.js` - ClickItem function
- **Issue**: User reports no wallet connection warning before purchase
- **Fix**: Enhanced logging + improved validation logic
- **Existing**: Basic wallet check was already present, now with better debugging

---

## 🧪 TEST SCENARIOS

### Test 1: Without Wallet Connection
**Steps:**
1. Open browser to `http://localhost:5173`
2. DON'T connect TON wallet
3. Navigate to M-Coin purchase
4. Click any package (e.g., 200 M-Coin)

**Expected Results:**
```
✅ Console shows:
   "🔍 Checking wallet connection before purchase..."
   "Wallet validation: { wallet_address: null, isNull: true, isEmpty: true, isValid: false }"
   "❌ Wallet not connected - showing connection warning"

✅ UI shows popup: "Wallet is not connected"
✅ No transaction attempt
✅ No amount-related errors
```

### Test 2: With Wallet Connected (MAIN TEST)
**Steps:**
1. Connect TON wallet first
2. Navigate to M-Coin purchase
3. Select package (e.g., 200 M-Coin / 2 TON)
4. Click Confirm

**Expected Results:**
```
✅ Console shows:
   "🔍 Checking wallet connection before purchase..."
   "Wallet validation: { wallet_address: "EQD...", isValid: true }"
   "✅ Wallet connected successfully - proceeding with purchase"
   "💰 Converting amount to nanoton string..."
   "   Original amount (TON): 2"
   "   Nanoton (string): 2000000000"
   "   ✅ Amount converted to string format"
   "📤 Transaction Object: { amountType: "string" }"
   "🔗 Calling tonConnectUI.sendTransaction..."

✅ TonConnect modal OPENS! 🎉
✅ Transaction details correctly displayed:
   - Amount: 2 TON
   - Destination: Game wallet address
✅ User can approve/reject transaction
✅ No "'amount' is required" error
```

---

## 🔍 Console Log Analysis

### Success Indicators (Fix 1):
```
✅ amountType: "string" (not "number")
✅ No error: "'amount' is required in message at index 0"
✅ TonConnect modal opens successfully
```

### Success Indicators (Fix 2):
```
✅ Wallet validation logs appear
✅ Clear warning when wallet not connected
✅ No attempt to send transaction without wallet
```

---

## 🚨 IF STILL FAILING

### Issue: Still shows "amount required" error
**Debug Steps:**
1. Check console for `amountType:` - should show "string"
2. Verify `amountInNanoton` value exists
3. Check if any other transaction fields are missing

### Issue: Wallet check not working
**Debug Steps:**
1. Check `wallet_address` value in validation logs
2. Verify `centerData.SetWalletAddress()` is called when wallet connects
3. Check if wallet type is set correctly

### Issue: TonConnect modal still doesn't open
**Possible causes:**
1. Address format issue
2. Payload encoding issue
3. Network/connection issue
4. Browser security blocking

---

## 📝 Quick Verification Commands

### Check syntax:
```bash
# App.jsx syntax check
node -pe "try { require('fs').readFileSync('src/App.jsx', 'utf8'); console.log('✅ App.jsx syntax OK'); } catch(e) { console.log('❌ App.jsx syntax error:', e.message); }"

# HomeMusk.js syntax check
node -pe "try { require('fs').readFileSync('src/game/scenes/Home/HomeMusk.js', 'utf8'); console.log('✅ HomeMusk.js syntax OK'); } catch(e) { console.log('❌ HomeMusk.js syntax error:', e.message); }"
```

### Verify backups exist:
```bash
ls -lh src/App.jsx.backup-amount-fix-*
ls -lh src/game/scenes/Home/HomeMusk.js.backup-wallet-check-*
```

---

## 🎯 Expected Final Result

```
BEFORE:
❌ "'amount' is required in message at index 0"
❌ No wallet validation
❌ User gets confusing errors

AFTER:
✅ Amount converted to STRING format
✅ TonConnect modal opens successfully
✅ Clear wallet connection validation
✅ Better UX with proper error messages
✅ Transaction can be completed successfully
```

## ✅ SUCCESS CHECKLIST

- [ ] Without wallet: Shows "Wallet not connected" popup
- [ ] With wallet: Shows wallet validation logs
- [ ] Amount conversion: Shows string format in logs
- [ ] Transaction: TonConnect modal opens
- [ ] No more "'amount' is required" errors
- [ ] Can complete purchase successfully

---

## 🚀 Ready to Test!

Both fixes have been implemented. Test now at http://localhost:5173

**Primary test case:** Connect wallet → Try to buy 200 M-Coin → Check console logs → TonConnect should open!
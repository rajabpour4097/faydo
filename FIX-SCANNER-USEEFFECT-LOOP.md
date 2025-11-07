# رفع مشکل حلقه useEffect در QR Scanner

## تاریخ: 8 نوامبر 2025

## مشکل

اسکنر QR به محض باز شدن modal، خطای "خطا در راه‌اندازی اسکنر" می‌داد حتی بدون هیچ اسکنی.

### علت اصلی

استفاده از `useState` برای `hasStarted` باعث trigger شدن مجدد `useEffect` می‌شد:

```typescript
// ❌ مشکل: هر بار که hasStarted تغییر می‌کند، useEffect دوباره اجرا می‌شود
const [hasStarted, setHasStarted] = useState(false)

useEffect(() => {
  if (isOpen && !hasStarted) {
    setHasStarted(true)  // این باعث re-render و trigger مجدد useEffect می‌شود!
    startScanner()
  }
}, [isOpen, hasStarted])  // hasStarted در dependencies
```

### جریان مشکل

1. Modal باز می‌شود → `isOpen = true`, `hasStarted = false`
2. useEffect اجرا می‌شود → `setHasStarted(true)` فراخوانی می‌شود
3. Component re-render می‌شود → `hasStarted = true`
4. useEffect دوباره trigger می‌شود (چون hasStarted تغییر کرد)
5. شرط `isOpen && !hasStarted` حالا false است اما useEffect باز هم اجرا شده
6. این باعث multiple render و مشکل در scanner initialization می‌شود

## راه‌حل

استفاده از `useRef` به جای `useState` برای tracking وضعیت initialization:

```typescript
// ✅ راه‌حل: useRef تغییرش باعث re-render نمی‌شود
const isInitializedRef = useRef(false)

useEffect(() => {
  if (isOpen && !isInitializedRef.current) {
    isInitializedRef.current = true  // فقط مقدار ref تغییر می‌کند، بدون re-render
    startScanner()
  }
  
  if (!isOpen) {
    isInitializedRef.current = false
  }

  return () => {
    // cleanup...
  }
}, [isOpen])  // فقط isOpen در dependencies
```

## تفاوت useState vs useRef

### useState
- ✅ برای state هایی که UI نیاز به نمایش آن‌ها دارد
- ✅ تغییرش باعث re-render می‌شود
- ❌ می‌تواند باعث حلقه‌های useEffect شود

### useRef
- ✅ برای نگهداری مقادیری که UI نیازی به نمایش آن‌ها ندارد
- ✅ تغییرش باعث re-render نمی‌شود
- ✅ برای جلوگیری از حلقه‌های useEffect عالی است
- ✅ مقدارش بین render ها حفظ می‌شود

## تغییرات اعمال شده

### 1. تغییر از useState به useRef

```diff
- const [hasStarted, setHasStarted] = useState(false)
+ const isInitializedRef = useRef(false)
```

### 2. ساده‌سازی useEffect

```diff
  useEffect(() => {
-   if (isOpen && !hasStarted) {
-     setHasStarted(true)
+   if (isOpen && !isInitializedRef.current) {
+     isInitializedRef.current = true
      startScanner()
    }
    
-   if (!isOpen && hasStarted) {
-     setHasStarted(false)
+   if (!isOpen) {
+     isInitializedRef.current = false
    }
    
    return () => {
      // cleanup...
    }
- }, [isOpen, hasStarted])
+ }, [isOpen])
```

### 3. بروزرسانی resetScanner

```diff
  const resetScanner = async () => {
    await stopScanner()
    setError(null)
    setShowManualEntry(false)
    setManualCode('')
    setIsLoadingBusiness(false)
    
-   setHasStarted(false)
+   isInitializedRef.current = false
    
    setTimeout(async () => {
-     setHasStarted(true)
+     isInitializedRef.current = true
      await startScanner()
    }, 200)
  }
```

### 4. بروزرسانی handleClose

```diff
  const handleClose = async () => {
    await stopScanner()
    setShowBusinessOptions(false)
    setBusinessInfo(null)
    setManualCode('')
    setShowManualEntry(false)
    setError(null)
    setIsLoadingBusiness(false)
-   setHasStarted(false)
+   isInitializedRef.current = false
    onClose()
  }
```

## نتیجه

✅ اسکنر فقط یک بار هنگام باز شدن modal راه‌اندازی می‌شود  
✅ هیچ حلقه useEffect وجود ندارد  
✅ دکمه "تلاش مجدد" به درستی کار می‌کند  
✅ بستن و باز کردن مجدد modal مشکلی ایجاد نمی‌کند  

## تست

برای تست کردن:

1. Modal را باز کنید
2. بررسی کنید که اسکنر بدون خطا راه‌اندازی می‌شود
3. اگر خطایی رخ داد، دکمه "تلاش مجدد" را بزنید
4. Modal را ببندید و دوباره باز کنید
5. همه موارد باید بدون مشکل کار کنند

## درس‌های آموخته شده

1. **هنگام استفاده از useEffect، به dependencies دقت کنید**
   - اگر state در dependencies است و در useEffect تغییر می‌کند، حلقه ایجاد می‌شود

2. **useRef را برای flag ها استفاده کنید**
   - برای tracking هایی که نیازی به re-render ندارند

3. **Console.log برای debugging useEffect loops بسیار مفید است**
   - می‌توانید ببینید چند بار و چرا trigger می‌شود

4. **Dependencies را minimal نگه دارید**
   - فقط مقادیری که واقعاً نیاز دارید useEffect وقتی تغییر کنند دوباره اجرا شود

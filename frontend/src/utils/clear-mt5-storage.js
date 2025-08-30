export const clearMT5LocalStorage = () => {
  localStorage.removeItem("mt5LastLogin")
  localStorage.removeItem("mt5LastServer")
  localStorage.removeItem("mt5Config")


  const keys = Object.keys(localStorage)
  keys.forEach((key) => {
    if (key.startsWith("mt5") || key.includes("MT5")) {
      localStorage.removeItem(key)
    }
  })

  console.log("[v0] Cleared all MT5 localStorage data")
}

import { createRoot } from "react-dom/client"
import { WindowManager } from "./components/window-manager"

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Initialize React components only after boot sequence is complete
  window.addEventListener("boot-sequence-complete", () => {
    // Mount window manager
    const windowManagerContainer = document.getElementById("react-window-manager")
    if (windowManagerContainer) {
      const root = createRoot(windowManagerContainer)
      root.render(<WindowManager />)
    }

    // Initialize other React components as needed
    initializeReactComponents()
  })
})

// Function to initialize other React components
function initializeReactComponents() {
  // Find all containers that need React components
  document.querySelectorAll("[data-react-component]").forEach((container) => {
    const componentName = container.getAttribute("data-react-component")

    // Dynamically import the component based on its name
    import(`./components/apps/${componentName}.js`)
      .then((module) => {
        const Component = module.default
        const props = JSON.parse(container.getAttribute("data-props") || "{}")

        const root = createRoot(container)
        root.render(<Component {...props} />)
      })
      .catch((error) => {
        console.error(`Failed to load component: ${componentName}`, error)
      })
  })
}

import React, {useState} from "react"
import ReactDOM from "react-dom"
import {Provider} from "react-redux"
import {BrowserRouter} from "react-router-dom"
import store from "./store"
import {DndProvider} from "react-dnd"
import {HTML5Backend} from "react-dnd-html5-backend"
import {ErrorBoundary} from "react-error-boundary"

import App from "./App"
//Styles
import "./styles/css/styles.css"
import "./styles/css/mana.css"
import "./styles/css/icons.css"
import utilities from "./utilities"
const {resetCache} = utilities

function ErrorFallback({error, componentStack, resetErrorBoundary}) {
  return (
    <div role="alert">
      <p>Something went wrong:</p>
      <pre>{error.message}</pre>
      <pre>{componentStack}</pre>
      <a href="">
        <button onClick={resetCache}>
          <h3>Refresh Page</h3>
        </button>
      </a>
    </div>
  )
}
ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <Provider store={store}>
        <BrowserRouter>
          <DndProvider backend={HTML5Backend}>
            <App />
          </DndProvider>
        </BrowserRouter>
      </Provider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
)

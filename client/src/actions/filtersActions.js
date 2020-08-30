// Constants
import store from "../store"
import * as A from "./types"

import utilities from "../utilities"

const {session} = utilities

export const changeFilters = (key, val) => dispatch => {
  session(A.FILTERS, key, val)
  dispatch({type: A.FILTERS, key, val})
}

export const changeAdvanced = assign => dispatch =>
  dispatch(
    changeFilters("advanced", {
      ...Object.assign(store.getState().filters.advanced, assign),
    })
  )

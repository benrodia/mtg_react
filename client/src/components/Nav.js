import React from "react"
import {connect} from "react-redux"
import actions from "../actions"
import {Link, NavLink, useLocation, useHistory} from "react-router-dom"
import {PieChart} from "react-minimal-pie-chart"

import Hamburger from "./Hamburger"
import BasicSearch from "./BasicSearch"
import DeckFeed from "./DeckFeed"
import Login from "./Login"
import DeckNav from "./DeckNav"
import QuickSearch from "./QuickSearch"
import ToolTip from "./ToolTip"
import Icon from "./Icon"

import utilities from "../utilities"

const logo = require("../imgs/mtggrip-logo-text.svg")
const iconDeck = require("../imgs/icon-deck.svg")

const {HOME_DIR, subTitle, COLORS, sum, pageButtons} = utilities

export default connect(
  ({
    auth: {user, isAuthenticated},
    main: {users, decks},
    deck: {slug, _id, colors, name, unsaved},
    settings: {showSubTitle},
  }) => {
    return {
      user,
      isAuthenticated,
      users,
      decks,
      slug,
      _id,
      colors,
      name,
      unsaved,
    }
  },
  actions
)(
  ({
    user,
    isAuthenticated,
    users,
    decks,
    slug,
    _id,
    colors,
    name,
    unsaved,
    openModal,
    openDeck,
    saveDeck,
    closeDeck,
  }) => {
    const {pathname} = useLocation()
    // <ToolTip message={`Advanced Deck Search`}>
    //   <NavLink
    //     to={`${HOME_DIR}/deck/search`}
    //     className="light-text tab"
    //     activeClassName={"selected"}>
    //     Decks
    //   </NavLink>
    // </ToolTip>

    return (
      <nav className="main-header mini-spaced-bar tab-switch">
        <div className="left flex-row even">
          <ToolTip message={`Main Dashboard`}>
            <NavLink
              to={`${HOME_DIR}/dash`}
              className={"title light-text tab bar pad"}
              activeClassName={"selected"}>
              <Icon src={logo} className="logo" />
            </NavLink>
          </ToolTip>
          {pageButtons.map(({label, link, icon, desc}) => (
            <ToolTip message={desc}>
              <NavLink
                className="tab"
                to={`${HOME_DIR}/${link}`}
                activeClassName={"selected"}>
                {label}
              </NavLink>
            </ToolTip>
          ))}
        </div>
        <div className="flex-row even mini-spaced-bar max nav-search-bar">
          <QuickSearch />
        </div>
        <div className="right flex-row even mini-spaced-bar">
          {isAuthenticated ? (
            <div className="flex-row even">
              {_id ? (
                <>
                  <NavLink
                    to={`${HOME_DIR}/deck/${slug}`}
                    className={"tab icon flex-row even mini-spaced-bar"}
                    activeClassName={"selected"}>
                    <ToolTip message={`View "${name}"`}>
                      <span className="flex-row even mini-spaced-bar">
                        <PieChart
                          data={COLORS("fill").map((color, i) => {
                            return {value: colors[i], color}
                          })}
                          startAngle={270}
                        />
                        <h3>
                          {name.length > 13 ? `${name.slice(0, 10)}...` : name}
                        </h3>
                      </span>
                    </ToolTip>
                    {unsaved ? (
                      <ToolTip message={`Save Changes to "${name}"`}>
                        <span onClick={saveDeck}>
                          <button className="inverse-small-button icon-unsaved" />
                        </span>
                      </ToolTip>
                    ) : (
                      <ToolTip message={`Close "${name}"`}>
                        <span onClick={openDeck}>
                          <Link
                            className="light-text warning-button inverse-small-button icon-cancel"
                            to={HOME_DIR}
                          />
                        </span>
                      </ToolTip>
                    )}
                  </NavLink>
                </>
              ) : null}

              <ToolTip message={`${user.name}'s Profile`}>
                <NavLink
                  to={`${HOME_DIR}/user/${user.slug}`}
                  className={"icon-user-circle-o light-text  tab"}
                  activeClassName={"selected"}
                />
              </ToolTip>
              <ToolTip message={`Display and Playtester settings`}>
                <NavLink
                  to={`${HOME_DIR}/settings`}
                  className={"icon-cog light-text  tab"}
                  activeClassName={"selected"}
                />
              </ToolTip>
            </div>
          ) : (
            <Link to={`${HOME_DIR}/login`}>
              <button className={`inver-button smaller-button`}>Log In</button>
            </Link>
          )}
        </div>
      </nav>
    )
  }
)

import * as A from "../actions/types"
import {INIT_PLAYTEST_STATE} from "../constants/initialState"
import {COLORS} from "../constants/definitions"
import {v4 as uuidv4} from "uuid"
import {timestamp} from "../functions/utility"
import {prepForPlaytest} from "../functions/receiveCards"

export default function main(playtest = INIT_PLAYTEST_STATE([], null, 0), {type, key, val, bool, list, format, cards}) {
	switch (type) {
		case A.PLAYTEST:
			return {...playtest, [key]: bool ? playtest[key] + val : val}
		case A.INIT_GAME:
			return {...INIT_PLAYTEST_STATE(list, format, playtest.num + 1)}
		case A.ADD_STACK:
			return {...playtest, stack: [...playtest.stack, {...val, key: playtest.stack.length}]}
		case A.RES_STACK:
			return {...playtest, stack: [...playtest.stack.slice(0, Math.max(0, playtest.stack.length - 1))]}
		case A.TOKEN:
			return {...playtest, deck: [...playtest.deck, ...prepForPlaytest(val, null, true)]}
		case A.HANDLE_MANA:
			return {
				...playtest,
				mana: val ? (bool ? [...val] : playtest.mana.map((m, i) => m + val[i])) : COLORS().map(_ => 0),
			}
		case A.CARD:
			return {
				...playtest,
				deck: playtest.deck.map(c => (!cards || cards.filter(cs => cs.key === c.key).length ? {...c, [key]: val} : c)),
			}
		case A.NEW_TURN:
			return {
				...playtest,
				turn: playtest.turn + 1,
				mana: COLORS().map(_ => 0),
				deck: playtest.deck.map(c => (c.zone !== "Battlefield" ? c : {...c, tapped: false, sickness: false})),
				landsPlayed: 0,
				phase: "Untap",
			}
		case A.SHUFFLE:
			const shuffled = playtest.deck.filter(c => c.zone === "Library").shuffle()
			const afterShuffle = shuffled
				.map((c, i) => {
					c.order = i
					return c
				})
				.concat(playtest.deck)
				.unique("key")
			return {...playtest, deck: afterShuffle, look: 0}

		case A.HISTORY:
			const slice = playtest.history.slice(Math.max(0, playtest.history.length - 50), playtest.current + 1)
			return {
				...playtest,
				current: playtest.current + 1,
				history: [
					...slice,
					{
						...playtest,
						history: [],
						timeID: uuidv4(),
						current: slice.length,
						timestamp: timestamp(),
						msg: val,
					},
				],
			}
		case A.TIME_TRAVEL:
			return {...(playtest.history.filter(h => h.timeID === val)[0] || playtest.current), history: playtest.history}

		// NO OP
		default:
			return playtest
	}
}

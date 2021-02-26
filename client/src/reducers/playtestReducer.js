import * as A from "../actions/types"
import {INIT_PLAYTEST_STATE} from "../constants/initialState"
import {COLORS} from "../constants/definitions"
import {v4 as uuidv4} from "uuid"
import {timestamp, wrapNum} from "../functions/utility"
import {normalizePos} from "../functions/cardFunctions"
import {prepForPlaytest} from "../functions/receiveCards"

export default function main(
	playtest = INIT_PLAYTEST_STATE([], null, 0),
	{type, key, val, bool, player, players, format, cards, init, apply}
) {
	switch (type) {
		case A.PLAYTEST:
			return apply
				? {...playtest, ...apply}
				: {...playtest, [key]: bool ? playtest[key] + val : val}
		case A.INIT_GAME:
			return {
				...playtest,
				...INIT_PLAYTEST_STATE(players, format, playtest.num + 1, player),
			}
		case A.ADD_STACK:
			return {
				...playtest,
				stack: [...playtest.stack, {...val, key: playtest.stack.length}],
			}
		case A.RES_STACK:
			return {
				...playtest,
				stack: [
					...playtest.stack.slice(0, Math.max(0, playtest.stack.length - 1)),
				],
			}
		case A.TOKEN:
			return {
				...playtest,
				players: players.map(p =>
					p.id === player
						? {
								...p,
								deck: [
									...playtest.players[player].deck,
									...prepForPlaytest(val, player, true),
								],
						  }
						: p
				),
			}
		case A.HANDLE_MANA:
			return {
				...playtest,
				mana: val
					? bool
						? [...val]
						: playtest.mana.map((m, i) => m + val[i])
					: COLORS().map(_ => 0),
			}
		case A.PLAYER:
			return {
				...playtest,
				players: playtest.players.map(p =>
					p === (player || playtest.active) ? {...p, [key]: val} : p
				),
			}
		case A.CARD:
			return {
				...playtest,
				players: playtest.players.map(p =>
					p.id === (player || playtest.active)
						? {
								...p,
								deck: normalizePos(
									p.deck.map(c => {
										if (cards.some(({key}) => c.key === key)) {
											return {...c, ...val}
										}
										return c
									})
								),
						  }
						: p
				),
			}
		case A.NEW_TURN:
			const newActive =
				player || wrapNum(playtest.active + 1, playtest.players.length)
			return {
				...playtest,
				turn: playtest.turn + (newActive === 0 ? 1 : 0),
				players: playtest.players.map((p, i) => {
					if (i === newActive) {
						p = {
							...p,
							mana: COLORS().map(_ => 0),
							deck: playtest.players[i].deck.map(c =>
								c.zone !== "Battlefield"
									? c
									: {...c, tapped: false, sickness: false}
							),
						}
					}
					return p
				}),
				active: newActive,
				phase: "Untap",
				first_seat: newActive,
				second_seat:
					playtest.second_seat === newActive
						? wrapNum(newActive + 1)
						: playtest.second_seat,
			}
		case A.SHUFFLE:
			let deck = playtest.players[player || playtest.active].deck
			deck = init
				? deck.map(c => {
						c.zone = "Library"
						return c
				  })
				: deck.filter(c => c.zone === "Library")

			let shuffled = deck.shuffle().map((c, i) => {
				c.order = i
				return c
			})
			if (!init) shuffled = deck.concat(deck).unique("key")

			return {
				...playtest,
				players: playtest.players.map(p => {
					if (p === (player || playtest.active))
						p = {...p, look: 0, reveal: false, deck: shuffled}
					return p
				}),
			}

		case A.HISTORY:
			const slice = playtest.history.slice(
				Math.max(0, playtest.history.length - 50),
				playtest.current + 1
			)
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
			return {
				...(playtest.history.filter(h => h.timeID === val)[0] ||
					playtest.current),
				history: playtest.history,
			}

		// NO OP
		default:
			return playtest
	}
}

import {Q} from "./cardFunctions"
import {sum} from "./utility"

export default function attackAll(attackers = []) {
	if (!attackers || !attackers.length) return false

	const total = sum(
		attackers.map(c => {
			return (
				(!isNaN(c.power) ? parseInt(c.power) : 0 + (c.counters.PlusOne || 0)) *
				(Q(c, "oracle_text", "double strike") || c.counters["Double strike"] ? 2 : 1)
			)
		})
	)
	const tapped = attackers.filter(c => !Q(c, "oracle_text", "vigilance"))

	return attackers.length ? {tapped, total} : false
}

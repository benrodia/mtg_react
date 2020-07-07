export function prepFatFile(mainFile,extraPropFile) {
		let reduced = removeProps(mainFile)
		// console.log('props removed!')
		// let withProps = addProps(extraPropFile,collapse)
		// reduced = collapsePrintings(reduced)
		// console.log('printings collapsed!')

		reduced = removeSomeImgLinks(reduced)
		// console.log('images reduced!')

		console.log('Minified bulk data',reduced)
		return reduced	
}

function removeProps(cardData) {
	let toRemove = [
		'id',
		'oracle_id',
		'card_back_id',
		'illustration_id',
		'multiverse_ids',
		'prints_search_uri',
		'set_search_uri',
		'object',
		'scryfall_uri',
		'set_uri',
		'uri',
		'scryfall_set_uri',
		'related_uris',
		'nonfoil',
		'layout',
		'digital',
		'arena_id',
		'oversized',
		// 'type_line',
		'variation',
		'watermark',
		'story_spotlight',
		'promo_types',
		'printings',
		'textless',
		'promo',
		'booster',
		'manaCost',
		'lang',
		// 'image_uris',
		'reserved',
		'full_art',
		'booster',
		'foil',
		// 'power',
		// 'toughness',
		'set_type',
		// 'types',
		'frame',
		'border_color',
		'reprint',
		'highres_image',
		// 'rulings_uri',
		'frame_effect',
		'games',
		'mtgo_foil_id',
		'tcgplayer_id',
		'collector_number',
		'all_parts',
		'artist_ids',
		'edh_rank',
		'mtgo_id',
		// 'set'
	]
	// console.log('removing props...')
	return cardData.map(card=>{
		for (var i = 0; i < toRemove.length; i++) {
			if (card[toRemove[i]] !== undefined) {
				delete card[toRemove[i]]
			}
		}
		return card
	})
}

function removeSomeImgLinks(cardData) {
	// console.log('cardData in removeSomeImgLinks:',cardData)
	return cardData.map(card=>{
		if (card.image_uris !== undefined) {
			card.img = {
				art_crop: card.image_uris.art_crop,
				png: card.image_uris.png,	
			}
		}  
		delete card.image_uris
		return card
	})
}

function collapsePrintings(cardData) {

	let toCollapse = [
		'artist',
		'released_at',
		'set_name',
		'image_uris'
	]


	let collapsed = []
	let remaining = [...cardData]
	while(remaining.length) {
		let multiPrinting = remaining.filter(c=>c.name === remaining[0].name)
		remaining = remaining.filter(c=>!multiPrinting.includes(c))
		let single = multiPrinting[0]
		for (var j = 0; j < toCollapse.length; j++) {
			let singlePropArray = multiPrinting.map(c=>c[toCollapse[j]])
			single[toCollapse[j]] = singlePropArray
		}
		single.printings = multiPrinting.length
		// console.log('printings',single)
		collapsed.push(single)
	}
	console.log('collapsed ' + cardData.length + ' into ' + collapsed.length)
	return collapsed
}



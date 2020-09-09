import React, {useEffect, useState} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"
import MdEditor from "react-markdown-editor-lite"
import Markdown from "markdown-to-jsx"

import BasicSearch from "./BasicSearch"
import Settings from "./Settings"

const {HOME_DIR, formattedDate, canEdit} = utilities

export default connect(({main: {cardData, decks, users}, auth: {isAuthenticated, user}}) => {
	return {
		cardData,
		decks,
		users,
		isAuthenticated,
		...user,
	}
}, actions)(({name, image, bio, openModal, cardData, updateUser}) => {
	const [reName, setReName] = useState(name)
	const [reImg, setReImg] = useState(image)
	const [reBio, setReBio] = useState(bio || "")
	return (
		<div className="">
			<div className="block">
				<h4>Change Display Name</h4>
				<input type="text" placeholder={name} value={reName} onChange={n => setReName(n.target.value)} />
				<p className="asterisk">(Your profile page URL will remain the same)</p>
			</div>

			<div className="block">
				<h4>Choose Avatar</h4>
				<div className="search-images">
					<BasicSearch
						limit={10}
						searchable
						options={cardData.filter(c => !!c.image_uris)}
						callBack={c => setReImg(c.image_uris.art_crop)}
						renderAs={c => <img src={c.image_uris.art_crop} alt={c.name} className="search-image" />}
					/>
				</div>
			</div>

			<div className="block">
				<h4>Edit Bio</h4>
				<MdEditor
					value={reBio}
					style={{height: "15rem"}}
					onChange={md => setReBio(md.text)}
					renderHTML={md => <Markdown>{md}</Markdown>}
				/>
			</div>

			<div className="big-block">
				<button
					onClick={_ =>
						updateUser({
							name: reName.length ? reName : name,
							image: reImg.length ? reImg : image,
							bio: reBio,
						})
					}>
					Apply Changes
				</button>
			</div>
		</div>
	)
})

import React from "react"

export default _ => {
	return (
		<div className="footer bar">
			<div className="links bar spaced-bar">
				<div className="version col">
					<h4>ReactMTG</h4>
					<p className="mini-block">Copyright {new Date().getFullYear()}</p>
					<p className="asterisk mini-block">Beta v0.8.0</p>
				</div>
				<div className="powered-by col">
					<h4>Powered By</h4>
					<a target="_blank" href="https://reactjs.org/" className="inverse-button">
						ReactJs
					</a>
					<a target="_blank" href="https://www.mongodb.com/" className="inverse-button">
						MongoDB
					</a>
					<a target="_blank" href="https://scryfall.com/" className="inverse-button">
						Scryfall API
					</a>
				</div>
				<div className="contributors col">
					<h4>Lovingly Crafted By</h4>
					<div className="bar even mini-spaced-bar">
						<a target="_blank" href="https://benrodia.com" className="clicky-icon">
							benrodia
						</a>
						<a target="_blank" href="https://github.com/benrodia/mtg_react" className="clicky-icon icon-github" />
						<a
							target="_blank"
							href="https://www.linkedin.com/in/benrodia/"
							className="clicky-icon icon-linkedin-squared"
						/>
					</div>
				</div>
			</div>
			<div className="call-to-action">
				<h2>Tell All Your Friends!</h2>
			</div>
		</div>
	)
}

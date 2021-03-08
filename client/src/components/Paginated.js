import React, {useState, useEffect} from "react"
import {connect} from "react-redux"
import actions from "../actions"
import utilities from "../utilities"

import Loading from "./Loading"
import BasicSearch from "./BasicSearch"

const {rnd, sum, paginate, pluralize} = utilities

export default connect(
	null,
	actions
)(({options, sorts, render, noOps, noOpsNoFilter}) => {
	const [page, setPage] = useState(0)
	const [pageLimit, setPageLimit] = useState(12)
	const [sortBy, setSortBy] = useState(sorts ? sorts[0].key : "name")
	const [asc, setAsc] = useState(false)
	const [pages, setPages] = useState([[]])

	useEffect(
		_ => {
			setPage(0)
			setPages(paginate(options.orderBy(sortBy, asc), pageLimit))
		},
		[options, sortBy, asc, pageLimit]
	)

	useEffect(
		_ => {
			const tab = e => {
				if (e.keyCode === 37 && page > 0) setPage(page - 1)
				if (e.keyCode === 39 && page < pages.length - 1) setPage(page + 1)
			}

			window.removeEventListener("keydown", tab, false)
			window.addEventListener("keydown", tab, false)
			return _ => window.removeEventListener("keydown", tab, false)
		},
		[page, pages]
	)

	const Pages = _ =>
		pages.length === 1 ? null : (
			<div className="pages bar even">
				<button
					key={"paginate_last"}
					className={`icon-left small-button ${page <= 0 && "disabled"}`}
					onClick={_ => setPage(page - 1)}
				/>
				{pages.length > 5 ? (
					<BasicSearch
						self={page}
						limit={pages.length}
						labelBy={o =>
							`Page ${parseInt(o) + 1} (${o * pageLimit + 1}-${
								o < pages.length - 1 ? (o + 1) * pageLimit : options.length
							})`
						}
						options={[...Array(pages.length)].map((_, i) => i)}
						callBack={o => setPage(parseInt(o))}
					/>
				) : (
					pages.map((_, i) => (
						<button
							key={"page_btn_" + i}
							className={`small-button ${page === i && "selected"}`}
							onClick={_ => setPage(i)}>
							{i + 1}
						</button>
					))
				)}
				<button
					key={"paginate_next"}
					className={`icon-right small-button ${
						page >= pages.length - 1 && "disabled"
					}`}
					onClick={_ => setPage(page + 1)}
				/>
			</div>
		)

	return (
		<div className={`big-block full-width spaced-col`}>
			<div className="flex-row end spread">
				{pages.length > 1 ? (
					<div className="col">
						<h4>
							{sum(pages.map(p => p.length))}{" "}
							{pluralize("Result", sum(pages.map(p => p.length)))}
						</h4>

						<Pages />
					</div>
				) : (
					<h2 className="bar even mini-spaced-bar">
						{noOps ||
							`${sum(pages.map(p => p.length))} ${pluralize(
								"Result",
								sum(pages.map(p => p.length))
							)}`}
					</h2>
				)}
				<div className="bar">
					{sorts && sorts.length && !noOpsNoFilter ? (
						<div>
							<h4>Sort By</h4>
							<div className="bar">
								<BasicSearch
									self={sorts.filter(f => f.key === sortBy)[0]}
									options={sorts}
									callBack={s => setSortBy(s.key)}
								/>
								<button className="small-button" onClick={_ => setAsc(!asc)}>
									{asc ? "ASC" : "DESC"}
								</button>
							</div>
						</div>
					) : null}
					{noOpsNoFilter ? null : (
						<div>
							<h4>Per Page</h4>
							<div className="bar">
								<BasicSearch
									className="small"
									self={pageLimit}
									options={[6, 12, 24, 36, 48]}
									callBack={s => setPageLimit(s)}
								/>
							</div>
						</div>
					)}
				</div>
			</div>
			{pages[page].length ? (
				<div className="bar">
					{pages[page].map((c, i) => (c ? render(c) : null))}
				</div>
			) : (
				<Loading spinner={" "} anim="none" message="No Matches :(" />
			)}
			<Pages />
		</div>
	)
})

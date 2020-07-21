import React from 'react'
import Select from 'react-select'
import matchSorter from 'match-sorter'
import {COLORS} from '../constants/definitions'

import '../functions/utility'
import {filterSearch} from '../functions/cardFunctions'



export default class CardSelect extends React.Component {
  constructor() {
    super()
    this.state = {
      options: [],
      filters: null,
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.options.length||props.filters!==state.filters) {
      let options = filterSearch(props.options,props.filters)
      return {
        limit: props.limit||20,
        options: options,
        filters: props.filters,
      }
    }
    return null
  }  



  render() {
    let i = 0
    return <Select
        isSearchable
        onChange={val=>this.props.callBack(val)}
        options={this.state.options}
        getOptionLabel={option=>option[this.props.labelBy]||option.name}
        getOptionValue={option=>option[this.props.valueBy]||option.key}
        filterOption={()=>i++ < this.props.limit}
        onInputChange={input => {i=0;
          this.setState({options: matchSorter(
            filterSearch(this.props.options,this.props.filters)
            ,input,
            {keys:this.props.filters&&this.props.filters.keys||['name']}
            )})
          }}
        placeholder={this.props.placeholder||'Search for...'}
        className={`card-select-container ${!this.props.options||!this.props.options.length?"hide":''}`}
        classNamePrefix={`card-select`}
      />
  }

}


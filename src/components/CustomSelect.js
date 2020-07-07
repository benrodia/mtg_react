import React from 'react'
import Select from 'react-select'
import matchSorter from 'match-sorter';
import '../functions/math';



export default class CustomSelect extends React.Component {
  constructor() {
    super()
    this.state = {
      options: [],
      selected: null,
      defaultValue: null
    }
    this.matchSort = this.matchSort.bind(this)
    this.handleSelect = this.handleSelect.bind(this)
  }

  static getDerivedStateFromProps(props, state) {
    if (!state.options.length) {
      return {
        limit: props.limit||50,
        options: props.options.sort((a,b)=>(a.name > b.name)?1:-1),
        defaultValue: props.options
          .filter(o=>o[props.valueBy]===props.defaultVal)[0] 
          ||null
      }
    }
    return null
  }  

  handleSelect(val) {
    this.setState({ selected: val })
    if (this.props.forPrint) {
      val = {...val,
        key: this.props.forPrint.key,
        board: this.props.forPrint.board,
      }
    }
    this.props.callBack(val,this.props.dest)
  }

  render() {
    let i = 0
    return <Select
        className={(!this.props.data||!this.props.data.length)&&"hide"}
        isSearchable
        // defaultValue={this.state.defaultValue}
        onChange={this.handleSelect}
        options={this.state.options}
        getOptionLabel={option=>option[this.props.labelBy]||option.name}
        getOptionValue={option=>option[this.props.valueBy]||option.key}
        filterOption={()=>i++ < this.state.limit}
        onInputChange={inputValue => {i=0;this.matchSort(inputValue)}}
        placeholder={this.props.placeholder||'Search for...'}
        // menuIsOpen={this.state.menuOpen}
      />
  }

  matchSort(inputValue) {
    let sorted = []
    if (inputValue.length) {
      sorted = matchSorter(
        this.props.options, 
        inputValue, 
        {keys: [this.props.sortBy||'name']}
      )
    }

    if(sorted.length>this.state.limit) sorted.length=this.state.limit
    sorted = sorted.unique('name')

    this.setState({options: sorted})
  }
}
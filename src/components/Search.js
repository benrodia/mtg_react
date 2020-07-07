import React from 'react'

import Select from 'react-select'

import '../functions/math'
            
export default class Search extends React.Component {

    state = {selectedValue: null}
        
    handleChange = s => {
        this.setState({selectedValue:s})
        if (this.props.sacrifice) {this.props.callBack(this.props.self,'Graveyard')}
        console.log('searched for ',this.props.list.filter(c=>c.cID===s.value)[0])
        this.props.callBack(this.props.list.filter(c=>c.cID===s.value)[0],this.props.dest)
    }

    
    render() {
        const resultLimit = 100
        let i = 0
        let options = this.props.list        
        .sort((a,b)=>(a.name>b.name)?1:-1)
        .map(c=>{return {
            label: c[this.props.optionLabel]||c.name,
            value: c.cID
        }})

        return <Select 
                isSeachable={this.props.search}
                value={options.find(obj => obj.value === this.state.selectedValue)}
                defaultValue={this.props.default}
                maxMenuHeight={200}
                filterOption={
                    ({label}, query) => label.indexOf(query) >= 0 && i++ < resultLimit
                } 
                onInputChange={()=>{i=0}} 
                options={options} 
                placeholder={this.props.text||"Tutor"} 
                onChange={this.handleChange} 
            />


    }
}

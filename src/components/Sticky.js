import React, {useEffect,useRef,useState} from 'react'

export default ({children,offset}) => {
  const [isSticky, setSticky] = useState(false)
  const ref = useRef(null)
  const handleScroll = _ => setSticky(window.pageYOffset>(offset||0))

  useEffect(_ => {
    window.addEventListener('scroll',handleScroll)
    return _=>window.removeEventListener('scroll',_=>handleScroll)
  },[])
  return React.cloneElement(children, {ref,className:`${children.props.className} ${isSticky&&'sticky'}`})
}

// const React = lib.react
import React from 'react'
//import { SvgIcon } from '@material-ui/core'
import {default as Icon} from '@ant-design/icons'

const InputSelectSvg = () => {
  return (
    <svg viewBox="0 0 1024 1024" width="1em" height="1em" fill="currentColor">
      <path d="M920 232a64 64 0 0 1 64 64v432a64 64 0 0 1-64 64H104a64 64 0 0 1-64-64V296a64 64 0 0 1 64-64h816z m-8 72H112v416h800V304z" p-id="57446"></path><path d="M517.053739 473.342607m25.896233-25.007701l0 0q25.896233-25.007701 50.903934 0.888532l94.473539 97.830212q25.007701 25.896233-0.888532 50.903935l0 0q-25.896233 25.007701-50.903934-0.888532l-94.473538-97.830213q-25.007701-25.896233 0.888531-50.903934Z" p-id="57447"></path><path d="M764.083261 422.397051m25.455844 25.455844l0 0q25.455844 25.455844 0 50.911688l-96.166522 96.166522q-25.455844 25.455844-50.911688 0l0 0q-25.455844-25.455844 0-50.911688l96.166522-96.166522q25.455844-25.455844 50.911688 0Z" p-id="57448"></path>
    </svg>
  )
}

const InputSelect = (props) => {
  return (
    <Icon component={InputSelectSvg} {...props} />
  )
}

// export SVG
InputSelect.SVG = InputSelectSvg

export { InputSelectSvg as SVG }

export default InputSelect



/*
<path d="M64 224h896a64 64 0 0 1 64 64v448a64 64 0 0 1-64 64H64a64 64 0 0 1-64-64V288a64 64 0 0 1 64-64z m0 64v448h896V288H64z m730.496 146.752L839.776 480 704 615.776 568.224 480l45.28-45.248L704 525.248l90.496-90.496z" p-id="46127"></path>


<path d="M882.6 839H147.5c-66.2 0-120-53.8-120-120V303c0-66.2 53.8-120 120-120h735.1c66.2 0 120 53.8 120 120v416c0 66.1-53.8 120-120 120zM147.5 263c-22.1 0-40 17.9-40 40v416c0 22.1 17.9 40 40 40h735.1c22.1 0 40-17.9 40-40V303c0-22.1-17.9-40-40-40H147.5z" p-id="34984"></path><path d="M716 629.4L536.8 478.2l51.6-61.1 123.8 104.5L817.8 419l55.7 57.4z" p-id="34985"></path>

<path d="M955.21572184 407.71337868H68.78427816V94.85641723h886.43144368v312.85889645zM120.92758882 355.57200303h782.14675736v-208.57324264H120.92662132v208.57324264z" p-id="29993"></path><path d="M955.21572184 929.14455027H68.78427816V355.57103553h886.43144368v573.57351474zM120.92758882 877.00123961h782.14675736V407.71434618H120.92662132v469.28689343zM746.64344671 313.856387l-88.64217687-88.64314437 36.49983371-36.49983372 52.14234316 52.14234317 52.14331066-52.14234317 36.49983372 36.49983372z" p-id="29994"></path><path d="M272.14173847 772.71558579h469.28786092v-52.14331066H272.14173847v52.14331066z m0-104.28662132h469.28786092V616.28662132H272.14173847v52.14331066z m0-156.42896447v52.14331066h469.28786092V512H272.14173847z" p-id="29995"></path>


<path d="M836.267 477.867h-230.4l115.2 123.733 115.2-123.733z" p-id="15402"></path>
<path d="M955.733 221.867h-896c-8.533 0-21.333 8.533-21.333 25.6V780.8c0 8.533 8.533 21.333 25.6 21.333h896c8.533 0 25.6-8.533 25.6-21.333V247.467c-4.267-17.067-17.067-25.6-29.867-25.6zM904.533 704c0 8.533-8.533 17.067-21.333 17.067H136.533C128 721.067 115.2 716.8 115.2 704V320c0-8.533 8.533-17.067 21.333-17.067h742.4c8.534 0 21.334 4.267 21.334 17.067v384z" p-id="15403"></path>

<path d="M844.334545 46.545455H179.665455A133.585455 133.585455 0 0 0 46.545455 179.665455v664.66909A133.585455 133.585455 0 0 0 179.665455 977.454545h664.66909A133.585455 133.585455 0 0 0 977.454545 844.334545V179.665455A133.585455 133.585455 0 0 0 844.334545 46.545455z m63.301819 794.996363a66.094545 66.094545 0 0 1-66.094546 66.094546H182.458182a66.094545 66.094545 0 0 1-66.094546-66.094546V182.458182A66.094545 66.094545 0 0 1 182.458182 116.363636h659.083636a66.094545 66.094545 0 0 1 66.094546 66.094546z m3.258181 2.792727" p-id="31499"></path><path d="M734.952727 365.847273L512 588.334545 289.047273 365.847273a33.047273 33.047273 0 1 0-46.545455 46.545454l247.621818 247.621818a32.116364 32.116364 0 0 0 46.545455 0l246.225454-247.621818a32.116364 32.116364 0 0 0 0-46.545454 33.978182 33.978182 0 0 0-46.545454 0z m0 0" p-id="31500"></path>

*/

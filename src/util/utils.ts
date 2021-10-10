import {Options} from 'ngx-vis';

export const nodeDefaultColor = {
  background: '#1E352F',
  border: '#A6C36F',
  hover: {
    border: '#5EB1BF',
    background: '#483D8B',
  },
  highlight: {
    border: '#5EB1BF',
    background: '#483D8B',
  }
};

export const edgeDefaultColor = {
  highlight: '#1E352F',
  color: '#A6C36F',
  hover: '#FFB90F',
  opacity: .5,
};


export const fullPhenonetConfig = {
  height: '100%',
  width: '100%',
  // autoResize: true,
  nodes: {
    shape: 'dot',
    color: nodeDefaultColor,
    font: {
      face: 'roboto',
    },
    scaling: {
      label: {
        enabled: true,
      }
    }
  },
  edges: {
    color: edgeDefaultColor,
    hoverWidth: 7,
    selectionWidth: 17,
    scaling: {
      min: 2,
      max: 17,
    },
    smooth: false,
  },
  layout: {
    randomSeed: 12,
    improvedLayout: true,
    hierarchical: {
      enabled: false,
    }
  },
  interaction: {
    hover: true,
    // tooltipDelay: 200,
    hideEdgesOnDrag: true,
    hideEdgesOnZoom: true,
    // multiselect: true,
    // navigationButtons: true,
    // selectable: true,
    // selectConnectedEdges:true,
  },
  physics: {
    stabilization: {
      enabled: true,
      iterations: 50,
    },
    maxVelocity: 50,
    minVelocity: 15,
    solver: 'forceAtlas2Based',
    forceAtlas2Based: {
      gravitationalConstant: -800,
      centralGravity: 0.1,
    },
  }

};


// TODO: if the above config makes nodes move use this
const temp = {
  forceAtlas2Based: {
    gravitationalConstant: -1700,
    centralGravity: 0.1,
    springConstant: 1,
    // avoidOverlap: 0.2
  }
};


const sPhenonetNodeDefaultColor = {
  background: '#1E352F',
  border: '#A6C36F',
  hover: {
    border: '#5EB1BF',
    background: '#483D8B',
  },
  highlight: {
    border: '#5EB1BF',
    background: '#483D8B',
  }
};

const sPhenonetEdgeDefaultColor = {
  highlight: '#1E352F',
  color: '#A6C36F',
  hover: '#FFB90F',
  opacity: .5,
};

export const sPhenonetConfig = {
  height: '100%',
  width: '100%',
  nodes: {
    shape: 'dot',
    color: sPhenonetNodeDefaultColor,
    font: {
      face: 'roboto',
    }
  },
  edges: {
    color: sPhenonetEdgeDefaultColor,
  },
  layout: {
    randomSeed: 12,
    improvedLayout: true,
    hierarchical: {
      enabled: false,
    }
  },
  interaction: {
    hover: true,
    // hoverConnectedEdges: false,
    hideEdgesOnDrag: true,
    hideEdgesOnZoom: true,
    // navigationButtons: true,
  },
};

export const gplEdgeColor = {
  highlight: '#1E352F',
  color: 'rgba(150,150,150,0.5)',
  hover: '#1E352F',
  opacity: .5,
};

export const gplConfig =  {
  height: '100%',
  width: '100%',
  layout: {
    randomSeed: 12,
    hierarchical: false,
    improvedLayout: true,
  },
  nodes: {
    shape: 'dot',
    font: {
      face: 'roboto',
      size: 22
    },
  },
  edges: {
    color: gplEdgeColor,
    hoverWidth: 7,
    selectionWidth: 17,
    scaling: {
      min: 4,
      max: 17,
    },
    smooth: false,
  },
  physics: {
    enabled: true,
    minVelocity: 15,
    solver: 'forceAtlas2Based',
    maxVelocity: 50,
    forceAtlas2Based: {
      // damping: 0.8,
      gravitationalConstant: -500,
      centralGravity: 0.05,
      avoidOverlap: 1
    },
    stabilization: {
      enabled: true,
      iterations: 1,
      fit: true
    },
  },
  interaction: {
    hover: true,
    // tooltipDelay: 200,
    hideEdgesOnDrag: true,
    hideEdgesOnZoom: true,
    // multiselect: true,
    // navigationButtons: true,
    // selectable: true,
    // selectConnectedEdges:true,
  },
} as Options;



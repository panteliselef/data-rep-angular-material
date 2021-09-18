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



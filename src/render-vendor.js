import _ from 'lodash';
import Renderer from './renderer';

const BASE_PORT = 8180;

let renderers = [];

const RenderVendor = {
  _nextPort: BASE_PORT,

  create(rendererOptions = {}) {
    let renderer;
    let options = _.defaults(rendererOptions, {
      port: RenderVendor._nextPort
    });

    if (options.port === RenderVendor._nextPort) {
      RenderVendor._nextPort += 1;
    }

    renderer = new Renderer(options);
    renderers.push(renderer);

    return renderer;
  },

  destroy(renderer) {
    renderers.splice(renderers.indexOf(renderer), 1);
    renderer.shutdown();
  },

  renderers() {
    return renderers;
  },

  shutdown() {
    renderers.forEach(RenderVendor.destroy);
    RenderVendor._nextPort = BASE_PORT;
  }
};

export { Renderer, RenderVendor };
export default RenderVendor;

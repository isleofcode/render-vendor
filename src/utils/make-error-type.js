export default function makeErrorType(_parent, _name, _defaultMessage) {
  let parent = _parent instanceof Error ? _parent : Error;
  let name = _parent instanceof Error ? `${_parent.name}.${_name}` : _parent;
  let defaultMessage = _parent instanceof Error ? _defaultMessage : _name;

  let CustomError = function(message = defaultMessage) {
    this.name = parent instanceof Error ? name : parent;
    this.message = message;
    this.stack = (new Error()).stack;
  };

  CustomError.prototype = Object.create(parent.prototype);
  CustomError.prototype.constructor = CustomError;

  return CustomError;
}

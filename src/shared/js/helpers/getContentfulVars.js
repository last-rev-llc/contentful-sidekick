import 'jquery';

export default () => {
  return [$('[name="contentful_space"]').attr('content'), $('[name="contentful_environment"]').attr('content')];
};

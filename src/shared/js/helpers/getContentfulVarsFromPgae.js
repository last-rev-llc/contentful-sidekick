import 'jquery';

export default () => {
  return {
    spaceId: $('[name="contentful_space"]').attr('content'),
    env: $('[name="contentful_environment"]').attr('content')
  };
};

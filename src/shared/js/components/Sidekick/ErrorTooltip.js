import { capitalize } from 'lodash';
import React from 'react';

const ErrorTooltip = ({ field, errors }) => {
  const msg = errors[field]
    ? `This field is missing. Click EDIT and enter a value.`
    : `This block has missing fields. Click EDIT and fill: <strong>${Object.keys(errors)
        .map((x) => capitalize(x))
        .join(',')}
    </strong>`;

  return (
    <div className="csk-tooltip-container">
      <ErrorIcon />
      <div className="csk-tooltip-content" dangerouslySetInnerHTML={{ __html: msg }} />
    </div>
  );
};

const ErrorIcon = () => (
  <svg
    className="csk-error-icon"
    version="1.1"
    id="Layer_1"
    x="0px"
    y="0px"
    viewBox="0 0 64 64"
    enableBackground="new 0 0 64 64"
    xmlSpace="preserve">
    <g>
      <g id="XMLID_47_">
        <g>
          <g>
            <path fill="#F94646" d="M32,0c17.7,0,32,14.3,32,32S49.7,64,32,64S0,49.7,0,32S14.3,0,32,0z" />
          </g>
        </g>
      </g>
      <g>
        <g>
          <g>
            <polygon fill="#FFFFFF" points="29,16 35,16 34,36 30,36" />
          </g>
        </g>
        <g>
          <g>
            <circle fill="#FFFFFF" cx="32" cy="44" r="4" />
          </g>
        </g>
      </g>
    </g>
  </svg>
);
export default ErrorTooltip;

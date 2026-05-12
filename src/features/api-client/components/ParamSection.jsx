import { getParamKey, schemaLabel } from '../lib/openapi.js'

export function ParamSection({
  emptyText,
  parameters,
  title,
  updateParam,
  values,
}) {
  return (
    <section className="form-section">
      <div className="section-heading">
        <h3>{title}</h3>
        <span>{parameters.length}</span>
      </div>
      <div className="param-list">
        {parameters.map((parameter) => {
          const key = getParamKey(parameter)
          return (
            <label className="param-field" key={key}>
              <span>
                {parameter.name}
                {parameter.required && <b> required</b>}
              </span>
              <input
                value={values[key] ?? ''}
                onChange={(event) => updateParam(parameter, event.target.value)}
                placeholder={schemaLabel(parameter.schema)}
              />
              {parameter.description && <small>{parameter.description}</small>}
            </label>
          )
        })}
        {!parameters.length && <p className="muted">{emptyText}</p>}
      </div>
    </section>
  )
}

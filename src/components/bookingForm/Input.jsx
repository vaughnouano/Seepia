import styles from "./Input.module.css";

export default function Input({
  type = "text",
  id,
  label,
  value,
  checked,
  onChange,
  onClick,
  options, // for type="radio": [{ value, label }]
  accept, // for type="file"
  required = false,
  disabled = false,
  placeholder,
}) {
  if (type === "checkbox") {
    return (
      <label className={styles.checkboxLabel}>
        <input
          className={styles.inputCheckbox}
          id={id}
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          onClick={onClick}
          required={required}
        />
        {label}
      </label>
    );
  }

  if (type === "radio") {
    return (
      <div className={styles.radioGroup}>
        {label && <label className={styles.groupLabel}>{label}</label>}
        {options.map((option) => (
          <label key={option.value} className={styles.radioLabel}>
            <input
              className={styles.inputRadio}
              type="radio"
              name={id}
              value={option.value}
              checked={value === option.value}
              onChange={(e) => onChange(e.target.value)}
              required={required}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  if (type === "file") {
    return (
      <div className={styles.field}>
        {label && <label htmlFor={id}>{label}</label>}
        <input
          className={styles.input}
          id={id}
          type="file"
          accept={accept}
          onChange={(e) => onChange(e.target.files)}
          required={required}
        />
      </div>
    );
  }

  // Generic case — covers text, number, date, time, tel, email, url
  return (
    <div className={styles.field}>
      {label && <label htmlFor={id}>{label}</label>}
      <input
        className={styles.input}
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
    </div>
  );
}

import React from "react";
import { Autocomplete, TextField, Chip } from "@mui/material";

const AutoComplete = ({
  options = [],
  value,
  onChange,
  label,
  placeholder,
  multiple = false,
  freeSolo = false,
  loading = false,
  error = false,
  helperText,
  getOptionLabel = (option) => option.label || option.name || option,
  getOptionValue = (option) => option.value || option.id || option,
  renderOption,
  renderTags,
  ...props
}) => {
  const handleChange = (event, newValue) => {
    if (multiple) {
      const values = newValue.map(getOptionValue);
      onChange(values);
    } else {
      onChange(newValue ? getOptionValue(newValue) : null);
    }
  };

  const getSelectedValue = () => {
    if (multiple) {
      return options.filter(
        (option) =>
          Array.isArray(value) && value.includes(getOptionValue(option))
      );
    } else {
      return options.find((option) => getOptionValue(option) === value) || null;
    }
  };

  return (
    <Autocomplete
      options={options}
      value={getSelectedValue()}
      onChange={handleChange}
      getOptionLabel={getOptionLabel}
      multiple={multiple}
      freeSolo={freeSolo}
      loading={loading}
      renderInput={(params) => (
        <TextField
          {...params}
          label={label}
          placeholder={placeholder}
          error={error}
          helperText={helperText}
          variant="outlined"
          size="small"
        />
      )}
      renderOption={renderOption}
      renderTags={
        renderTags ||
        (multiple
          ? (value, getTagProps) =>
              value.map((option, index) => (
                <Chip
                  variant="outlined"
                  label={getOptionLabel(option)}
                  {...getTagProps({ index })}
                  key={index}
                />
              ))
          : undefined)
      }
      {...props}
    />
  );
};

export default AutoComplete;

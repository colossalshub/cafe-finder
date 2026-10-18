type SearchFieldProps = {
  value: string;
  onChange: (value: string) => void;
};

export function SearchField({ value, onChange }: SearchFieldProps) {
  return (
    <form
      className="search"
      role="search"
      onSubmit={(event) => event.preventDefault()}
    >
      <label htmlFor="cafe-search">Search</label>
      <div className={value ? "search-control has-value" : "search-control"}>
        <input
          id="cafe-search"
          type="search"
          placeholder="Search café names"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
        {value ? (
          <button type="button" className="search-clear" aria-label="Clear search" onClick={() => onChange("")}>
            Clear
          </button>
        ) : null}
      </div>
    </form>
  );
}

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
      <input
        id="cafe-search"
        type="search"
        placeholder="Search café names"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </form>
  );
}

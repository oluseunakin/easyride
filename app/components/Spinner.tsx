export function Spinner(props: { height: string; width: string }) {
  const { width, height } = props;
  return (
    <div
      className={(() =>
        `animate-spin rounded-full border-2 border-gray-500 border-t-gray-300 ${width} ${height}`)()}
    ></div>
  );
}

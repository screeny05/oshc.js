export function chunk<T>(input: T[], chunkSize: number): T[][] {
  var result: T[][] = [];
  for (var i = 0; i < input.length; i += chunkSize)
    result.push(input.slice(i, i + chunkSize));
  return result;
}

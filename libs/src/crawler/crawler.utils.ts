/**
 * The function `getSessionCode` takes a session type as input and returns a corresponding session
 * code.
 * @param {string} type - The `type` parameter is a string that represents the type of session. It can
 * have one of the following values: 'Ordinaria', 'Extraordinaria', or 'Solemne'.
 * @returns a string value. The specific string value being returned depends on the input parameter
 * "type". If "type" is equal to 'Ordinaria', the function returns '1'. If "type" is equal to
 * 'Extraordinaria', the function returns '2'. If "type" is equal to 'Solemne', the function returns
 * '3'. If none of these
 */
export const getSessionCode = (type: string) => {
  switch (type) {
    case 'Ordinaria':
      return '1'
    case 'Extraordinaria':
      return '2'
    case 'Solemne':
      return '3'
    default:
      return '1'
  }
}

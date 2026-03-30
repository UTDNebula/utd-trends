type SearchParamsLike = {
  get: (key: string) => string | null;
};

export function isValidAvailabilitySemester(
  semester: string | null | undefined,
  availableSemesters: string[],
): semester is string {
  return !!semester && availableSemesters.includes(semester);
}

export function getValidAvailabilitySemester(
  searchParams: SearchParamsLike,
  availableSemesters: string[],
): string | null {
  const availability = searchParams.get('availability');
  return isValidAvailabilitySemester(availability, availableSemesters)
    ? availability
    : null;
}

export function setAvailabilitySemester(
  params: URLSearchParams,
  semester: string,
) {
  params.set('availability', semester);
}

export function clearAvailabilitySemester(params: URLSearchParams) {
  params.delete('availability');
}

export const extractData = (
  formData: { name: string; label: string; type: string; placeholder: string; value: string }[]
) => {
  return formData.reduce((acc, curr) => {
    if(curr.name === "price") {
        acc[curr.name] = Number(curr.value);
    } else {
        acc[curr.name] = curr.value;
    }
    return acc;
  }, {} as Record<string, any>);
};

interface InfoCardProps {
  title: string;
  data: { label: string; value: string }[];
  onRemove: () => void;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, data, onRemove }) => {
  return (
    <div className="bg-white p-4 shadow rounded-md relative w-full max-w-sm">
      <button
        className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
        onClick={onRemove}
      >
        ×
      </button>
      <div className="text-sm">
        <h4 className="font-semibold mb-2">{title}</h4>
        {data.map((item, index) => (
          <p key={index}>
            <span className="font-bold">{item.label}: </span>
            {item.value}
          </p>
        ))}
      </div>
    </div>
  );
};
export default InfoCard
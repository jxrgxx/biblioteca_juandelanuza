function LibroCard({ libro }) {
  const statusStyles = {
    Disponible: "bg-green-100 text-green-700 border-green-200",
    Prestado: "bg-orange-100 text-orange-700 border-orange-200",
    Extraviado: "bg-red-100 text-red-700 border-red-200",
    "No Disponible": "bg-gray-100 text-gray-700 border-gray-200"
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-lg text-gray-800 leading-tight">{libro.titulo_libro}</h3>
        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${statusStyles[libro.estado_libro] || statusStyles["No Disponible"]}`}>
          {libro.estado_libro.toUpperCase()}
        </span>
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p><span className="font-medium text-gray-400">Autor:</span> {libro.autor_libro}</p>
        <p><span className="font-medium text-gray-400">Género:</span> {libro.genero_libro}</p>
      </div>

      <div className="mt-5 flex gap-2">
        <button className="flex-1 text-sm font-semibold py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition">
          Prestar
        </button>
        <button className="flex-1 text-sm font-semibold py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-200 transition">
          Detalles
        </button>
      </div>
    </div>
  );
}

export default LibroCard;
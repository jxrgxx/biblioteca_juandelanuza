import { useNavigate } from 'react-router-dom';

function LibroCard({ libro, user }) {
  const navigate = useNavigate();
  const statusStyles = {
    Disponible: 'bg-green-100 text-green-700 border-green-200',
    Prestado: 'bg-orange-100 text-orange-700 border-orange-200',
    Extraviado: 'bg-red-100 text-red-700 border-red-200',
    'No Disponible': 'bg-gray-100 text-gray-700 border-gray-200',
  };

  const handleImageError = (e) => {
    e.target.src = '/portadas/default.png';
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col h-full">
      {/* 1. ÁREA DE IMAGEN (PORTADA) */}
      <div className="relative aspect-[3/4] bg-slate-100 overflow-hidden">
        <img
          src={
            libro.portada_img
              ? `/portadas/${libro.portada_img}`
              : '/portadas/default.png'
          }
          alt={libro.titulo}
          onError={handleImageError}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Badge de estado flotante */}
        <div className="absolute top-2 right-2">
          <span
            className={`text-[9px] font-lanuza font-medium px-2 py-0.5 rounded-full border shadow-sm backdrop-blur-md ${statusStyles[libro.estado] || statusStyles['No Disponible']}`}
          >
            {libro.estado?.toUpperCase()}
          </span>
        </div>
      </div>

      {/* 2. CUERPO DE LA TARJETA */}
      <div className="p-5 flex flex-col flex-1">
        {/* Título del libro */}
        <h3 className="font-lanuza font-bold text-lg text-slate-800 leading-tight mb-4 min-h-[3rem] line-clamp-2">
          {libro.titulo}
        </h3>

        {/* METADATOS */}
        <div className="text-sm space-y-2 font-lanuza flex-1">
          <p className="text-slate-500">
            <span className="font-medium text-black mr-1">Autor:</span>
            {libro.autor}
          </p>
          <p className="text-slate-500">
            <span className="font-medium text-black mr-1">Género:</span>
            {libro.genero}
          </p>
          <p className="text-slate-500">
            <span className="font-medium text-black mr-1">Editorial:</span>
            {libro.editorial}
          </p>
          <p className="text-slate-500">
            <span className="font-medium text-black mr-1">
              Año Publicación:
            </span>
            {libro.anyo_publicacion}
          </p>
          <p className="text-slate-500">
            <span className="font-medium text-black mr-1">Paginas:</span>
            {libro.paginas}
          </p>
        </div>

        {/* 3. BOTONES DE ACCIÓN */}
        <div className="mt-6 flex gap-2">
          {/* Botón Detalles: Visible para todos */}
          <button
            onClick={() => navigate(`/libro/${libro.id_libro}`)}
            className="flex-1 text-xs font-bold py-3 bg-slate-100 text-slate-600 rounded-xl hover:bg-slate-200 transition-all transform active:scale-95 uppercase tracking-wider"
          >
            Detalles
          </button>
        </div>
      </div>
    </div>
  );
}

export default LibroCard;

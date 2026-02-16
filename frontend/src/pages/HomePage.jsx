import { useState, useEffect } from 'react'
import apiV1 from '../api/client'

export default function HomePage() {
  const [ping, setPing] = useState(null)
  const [error, setError] = useState(null)

  useEffect(() => {
    apiV1.get('/ping')
      .then((res) => setPing(res.data))
      .catch((err) => setError(err.message))
  }, [])

  return (
    <div className="page-home">
      <h1>Добро пожаловать</h1>
      <p>Фронтенд подключён к API v1.</p>
      {ping && (
        <div className="api-ping">
          <strong>API v1:</strong> {ping.message} ({ping.timestamp})
        </div>
      )}
      {error && (
        <div className="api-error">
          Ошибка запроса к API: {error}. Запустите Laravel: <code>php artisan serve</code>
        </div>
      )}
    </div>
  )
}

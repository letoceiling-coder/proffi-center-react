// Инициализация sketch canvas с paper.js
export function initSketch(canvasElement, onReadyCallback) {
  if (!canvasElement) {
    console.warn('Canvas element not provided')
    return
  }

  // Ждем, пока Paper.js загрузится
  if (typeof window.paper === 'undefined') {
    console.warn('Paper.js не загружен, ожидание...')
    setTimeout(() => initSketch(canvasElement, onReadyCallback), 100)
    return
  }

  try {
    // Получаем canvas элемент
    let canvas = null
    if (canvasElement instanceof HTMLCanvasElement) {
      canvas = canvasElement
    } else if (typeof canvasElement === 'string') {
      canvas = document.getElementById(canvasElement)
    } else if (canvasElement.id) {
      canvas = document.getElementById(canvasElement.id)
    } else {
      canvas = document.getElementById('myCanvas')
    }

    if (!canvas) {
      console.error('Canvas элемент не найден')
      return
    }

    // Вызываем сохраненный callback из sketch.js если он есть
    // В оригинале callback содержит:
    // - paper.install(window) - строка 129
    // - paper.setup("myCanvas") - строка 130
    // - var tool = new Tool() - строка 131
    // - g_layer = project.activeLayer - строка 132
    // - sketch = new Sketch() - строка 133
    // - clicks() - строка 135 (вызовется автоматически)
    // - resize_canvas() - строка 136 (вызовется автоматически)
    if (window.SKETCH_READY_CALLBACK && typeof window.SKETCH_READY_CALLBACK === 'function') {
      // НЕ вызываем paper.setup() здесь, так как это будет сделано внутри callback
      // Перехватим paper.setup() внутри callback, чтобы использовать правильный canvas
      
      // Вызываем callback с задержкой, чтобы все элементы были в DOM
      setTimeout(() => {
        try {
          // Сохраняем оригинальный paper.setup
          const originalPaperSetup = window.paper.setup.bind(window.paper)
          
          // Перехватываем paper.setup чтобы использовать правильный canvas
          let setupCalled = false
          window.paper.setup = function(canvasArg) {
            if (typeof canvasArg === 'string' && canvasArg === 'myCanvas') {
              const realCanvas = canvas || document.getElementById('myCanvas')
              if (realCanvas) {
                console.log('paper.setup перехвачен, используется реальный canvas элемент')
                const result = originalPaperSetup(realCanvas)
                setupCalled = true
                // Восстанавливаем оригинальный setup после первого вызова
                window.paper.setup = originalPaperSetup
                return result
              }
            }
            const result = originalPaperSetup(canvasArg)
            setupCalled = true
            return result
          }
          
          // Временно включаем автоинициализацию для выполнения callback
          const wasAutoInit = window.SKETCH_AUTO_INIT
          window.SKETCH_AUTO_INIT = true
          
          // Вызываем callback - он содержит весь код инициализации
          // clicks() будет вызвана автоматически внутри callback на строке 135
          window.SKETCH_READY_CALLBACK()
          
          // Возвращаем предыдущее значение
          window.SKETCH_AUTO_INIT = wasAutoInit
          
          console.log('Callback из sketch.js вызван успешно, clicks() должна быть выполнена внутри callback')
          
          // Проверяем, что paper.view существует и вызываем draw()
          // paper.setup() должен был быть вызван внутри callback, создав paper.view
          // Используем несколько попыток с увеличивающейся задержкой
          let drawAttempts = 0
          const maxDrawAttempts = 5
          const tryDraw = () => {
            drawAttempts++
            if (window.paper && window.paper.view) {
              try {
                window.paper.view.draw()
                console.log('Paper.js view.draw() вызван успешно')
                // Вызываем callback для скрытия прелоадера
                if (onReadyCallback && typeof onReadyCallback === 'function') {
                  onReadyCallback()
                }
              } catch (e) {
                console.warn('Ошибка при вызове paper.view.draw():', e)
              }
            } else if (drawAttempts < maxDrawAttempts) {
              console.log(`Попытка ${drawAttempts} из ${maxDrawAttempts}: paper.view еще не готов, ожидание...`)
              setTimeout(tryDraw, 100 * drawAttempts)
            } else {
              console.warn('paper.view не создан после', maxDrawAttempts, 'попыток')
              // Скрываем прелоадер даже если view.draw() не был вызван
              if (onReadyCallback && typeof onReadyCallback === 'function') {
                onReadyCallback()
              }
            }
          }
          setTimeout(tryDraw, 50)
          
        } catch (error) {
          console.error('Ошибка при вызове callback из sketch.js:', error)
          // Скрываем прелоадер при ошибке
          if (onReadyCallback && typeof onReadyCallback === 'function') {
            onReadyCallback()
          }
          // Пытаемся инициализировать вручную
          initSketchManually()
        }
      }, 1200)
    } else {
      // Инициализируем вручную если callback не был сохранен
      console.log('Callback не найден, используем ручную инициализацию')
      // Инициализация paper.js
      if (window.paper && window.paper.install) {
        window.paper.install(window)
      }
      window.paper.setup(canvas)
      
      // Проверяем, что paper.view существует перед вызовом draw()
      if (window.paper && window.paper.view) {
        try {
          window.paper.view.draw()
          console.log('Paper.js view.draw() вызван успешно')
          // Вызываем callback для скрытия прелоадера
          if (onReadyCallback && typeof onReadyCallback === 'function') {
            onReadyCallback()
          }
        } catch (e) {
          console.warn('Ошибка при вызове paper.view.draw():', e)
          // Скрываем прелоадер даже при ошибке
          if (onReadyCallback && typeof onReadyCallback === 'function') {
            onReadyCallback()
          }
        }
      } else {
        // Если paper.view не существует, скрываем прелоадер
        if (onReadyCallback && typeof onReadyCallback === 'function') {
          onReadyCallback()
        }
      }
      
      initSketchManually()
    }
    
    console.log('Paper.js и sketch.js инициализированы успешно')
    
    function setupGlobalVariables() {
      // Инициализируем глобальные переменные из sketch.js
      if (typeof window.Tool !== 'undefined') {
        try {
          const tool = new window.Tool()
          window.g_tool = tool
        } catch (e) {
          console.warn('Не удалось создать Tool:', e)
        }
      }
      
      if (window.paper.project && window.paper.project.activeLayer) {
        window.g_layer = window.paper.project.activeLayer
      }
      
      // Инициализируем Sketch класс если доступен
      if (typeof window.Sketch !== 'undefined') {
        try {
          window.sketch = new window.Sketch()
        } catch (e) {
          console.warn('Не удалось создать Sketch:', e)
        }
      }
    }
    
    function initSketchManually() {
      setupGlobalVariables()
      
      // Вызываем функции инициализации из sketch.js если они доступны
      // Обертываем в try-catch для безопасности
      // Откладываем вызов clicks() - он требует наличия всех элементов DOM
      const callClicks = () => {
        if (typeof window.clicks !== 'function') {
          console.warn('Функция clicks() не найдена')
          return false
        }
        
        try {
          // Минимальный набор критически важных элементов
          // Остальные элементы могут быть созданы динамически
          const criticalElements = [
            'myCanvas',
            'sketch_editor'
          ]
          
          const missingCritical = criticalElements.filter(id => {
            const el = document.getElementById(id)
            if (!el) {
              console.warn('Отсутствует критический элемент:', id)
            }
            return !el
          })
          
          if (missingCritical.length > 0) {
            return false
          }
          
          // Пробуем вызвать clicks() даже если некоторые элементы отсутствуют
          // Функция должна сама проверять наличие элементов перед установкой обработчиков
          console.log('Попытка вызвать clicks()...')
          window.clicks()
          console.log('clicks() вызван успешно')
          return true
        } catch (e) {
          console.warn('Ошибка при вызове clicks():', e.message)
          // Пробуем вызвать безопасную версию clicks() с проверками
          return callClicksSafely()
        }
      }
      
      // Безопасная версия clicks() с оберткой для каждого вызова getElementById
      const callClicksSafely = () => {
        if (typeof window.clicks !== 'function') {
          return false
        }
        
        // Создаем безопасную обертку для getElementById и установки onclick
        const originalGetElementById = document.getElementById.bind(document)
        const safeElements = new Map() // Кэш для безопасных элементов
        
        // Перехватываем getElementById
        document.getElementById = function(id) {
          const el = originalGetElementById(id)
          if (!el) {
            // Если элемент не найден, создаем заглушку для некритичных элементов
            if (id.includes('btn_') || id.includes('popup_') || id.includes('select_') || 
                id.includes('coordinates_') || id.includes('num') || id === 'comma' || id === 'comma2') {
              if (!safeElements.has(id)) {
                const stub = document.createElement('div')
                stub.id = id
                stub.style.display = 'none'
                stub.setAttribute('data-stub', 'true')
                safeElements.set(id, stub)
              }
              return safeElements.get(id)
            }
          }
          return el
        }
        
        // Перехватываем установку onclick для безопасности
        const originalOnclickSetter = Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'onclick').set
        
        Object.defineProperty(HTMLElement.prototype, 'onclick', {
          set: function(value) {
            if (this.getAttribute('data-stub') === 'true') {
              // Игнорируем установку onclick на заглушках
              return
            }
            return originalOnclickSetter.call(this, value)
          },
          get: function() {
            return this._onclick || null
          },
          configurable: true
        })
        
        try {
          window.clicks()
          console.log('clicks() вызван с безопасной оберткой')
          return true
        } catch (e) {
          console.warn('Ошибка даже с безопасной оберткой:', e.message)
          return false
        } finally {
          // Восстанавливаем оригинальные функции
          document.getElementById = originalGetElementById
          Object.defineProperty(HTMLElement.prototype, 'onclick', {
            set: originalOnclickSetter,
            get: function() { return this._onclick || null },
            configurable: true
          })
        }
      }
      
      // Пробуем вызвать clicks() с несколькими попытками
      let attempts = 0
      const maxAttempts = 8
      const attemptInterval = 600
      
      const tryCallClicks = () => {
        attempts++
        console.log(`Попытка ${attempts} из ${maxAttempts} вызвать clicks()`)
        
        if (callClicks()) {
          return // Успешно вызвано
        }
        
        if (attempts < maxAttempts) {
          setTimeout(tryCallClicks, attemptInterval)
        } else {
          console.warn('clicks() не удалось вызвать после', maxAttempts, 'попыток')
          console.warn('Приложение будет работать, но некоторые обработчики событий могут быть не установлены')
        }
      }
      
      // Начинаем попытки через 1.5 секунды
      setTimeout(tryCallClicks, 1500)
      
      // Откладываем resize_canvas() тоже
      setTimeout(() => {
        if (typeof window.resize_canvas === 'function') {
          try {
            // Проверяем наличие необходимых элементов перед вызовом
            const canvasEl = document.getElementById('myCanvas')
            if (canvasEl && canvasEl.offsetWidth > 0 && window.paper && window.paper.view) {
              window.resize_canvas()
              console.log('resize_canvas() вызван успешно')
            } else {
              console.warn('Canvas еще не готов для resize_canvas()')
              // Пробуем еще раз
              setTimeout(() => {
                const canvasEl2 = document.getElementById('myCanvas')
                if (canvasEl2 && canvasEl2.offsetWidth > 0 && window.paper && window.paper.view) {
                  try {
                    window.resize_canvas()
                    console.log('resize_canvas() вызван после повторной проверки')
                  } catch (e) {
                    console.warn('Ошибка при повторном вызове resize_canvas():', e)
                  }
                }
              }, 500)
            }
          } catch (e) {
            console.warn('Ошибка при вызове resize_canvas():', e)
          }
        }
      }, 1000)
      
      // Настраиваем обработчик resize
      if (window.jQuery && typeof window.resize_canvas === 'function') {
        window.jQuery(window).off('resize.sketch').on('resize.sketch', function() {
          try {
            if (window.resize_canvas) window.resize_canvas()
            if (window.sketch && window.sketch.alignCenter) window.sketch.alignCenter()
          } catch (e) {
            console.warn('Ошибка в обработчике resize:', e)
          }
        })
      }
    }
    
  } catch (error) {
    console.error('Ошибка инициализации Paper.js:', error)
    // Скрываем прелоадер при ошибке
    if (onReadyCallback && typeof onReadyCallback === 'function') {
      onReadyCallback()
    }
    // Отключаем автоинициализацию при ошибке
    window.SKETCH_AUTO_INIT = false
  }
}


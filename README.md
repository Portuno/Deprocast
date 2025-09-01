# Deprocast - Sistema de Productividad Basado en Neurociencia

## Descripción

Deprocast es una aplicación web que combina principios de neurociencia con técnicas de productividad para ayudar a los usuarios a superar la procrastinación y lograr sus objetivos de manera efectiva.

## Sistema de Onboarding

El sistema de onboarding implementa un flujo completo de **15 slides** que se ejecuta cuando un usuario está logueado pero no ha completado el proceso de onboarding (`onboarding_completed = false`).

### 🎯 **Objetivo del Onboarding**

El onboarding culmina con la **creación real** de:
1. **Un proyecto completo** con toda la información necesaria
2. **Microtareas generadas automáticamente** basadas en el proyecto
3. **Una entrada en el diario** documentando el inicio del viaje

### 📋 **15 Slides del Onboarding**

1. **Welcome** - Bienvenida e introducción
2. **Neuroscience** - Explicación científica de la procrastinación
3. **User Profile** - Recolección de patrones de trabajo
4. **Project Title** - Información sobre dividir proyectos en microtareas
5. **Project Description & Timeline** - Descripción y fecha objetivo (3 días)
6. **More About Neuroscience** - Concepto de microtareas
7. **Project Details** - Tipo de proyecto y dificultad percibida (1-10)
8. **Motivation & Challenges** - Motivación, obstáculos y habilidades necesarias
9. **Generate Micro-Tasks** - Generación de microtareas con IA
10. **Pomodoro+ Protocol** - Explicación del protocolo
11. **Celebration** - Importancia de celebrar logros
12. **Growth Journal** - Propósito del diario de crecimiento
13. **Context Blueprint Generator** - Explicación del generador
14. **Understanding Context Blueprint** - Detalles del archivo JSON
15. **Activate User Persona** - Activación con pantalla de carga de 12 segundos

### 🗃️ **Datos Recolectados**

#### **Perfil del Usuario:**
- `energyLevel`: Patrón de energía (morning, afternoon, evening, variable)
- `distractionSusceptibility`: Susceptibilidad a distracciones (low, medium, high, very-high)
- `imposterSyndrome`: Nivel de síndrome del impostor (never, sometimes, often, always)

#### **Información del Proyecto:**
- `projectTitle`: Título del proyecto
- `projectDescription`: Descripción detallada
- `targetCompletionDate`: Fecha objetivo (recomendado 3 días)
- `projectType`: Tipo de proyecto (development, marketing, design, writing, business, learning, health, other)
- `perceivedDifficulty`: Dificultad percibida (1-10)
- `motivation`: Motivación para completar el proyecto
- `knownObstacles`: Lista de obstáculos conocidos
- `skillsNeeded`: Habilidades o recursos necesarios

## 🏗️ **Arquitectura del Sistema**

### **Componentes Principales:**

1. **`useOnboarding` Hook** - Maneja el estado del onboarding
2. **`OnboardingFlow`** - Componente principal del flujo de 15 slides
3. **`OnboardingForm`** - Formularios dinámicos para recolección de datos
4. **`onboardingService`** - Servicio para procesar datos y crear entidades

### **Base de Datos:**

- **`profiles`** - Campo `onboarding_completed` para controlar el estado
- **`onboarding_data`** - Datos específicos del onboarding del usuario
- **`projects`** - Proyectos con campos extendidos para onboarding
- **`tasks`** - Microtareas generadas automáticamente
- **`journal_entries`** - Entradas del diario de crecimiento

## 🚀 **Instalación y Configuración**

### **Prerrequisitos:**
- Node.js 18+
- Supabase account
- PostgreSQL database

### **Pasos de Instalación:**

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd Deprocast
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   ```bash
   cp .env.example .env.local
   # Editar .env.local con tus credenciales de Supabase
   ```

4. **Ejecutar scripts de base de datos en Supabase:**
   ```sql
   -- En orden de ejecución:
   -- 015_add_onboarding_completed_field.sql
   -- 016_create_onboarding_data_table.sql
   -- 017_update_projects_table_onboarding.sql
   ```

5. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

## 📊 **Flujo de Funcionamiento**

### **1. Usuario se Registra/Logea**
- Se crea automáticamente un perfil con `onboarding_completed = false`

### **2. Verificación de Onboarding**
- `useOnboarding` verifica el estado del usuario
- Si no está completado, se muestra `OnboardingFlow`

### **3. Proceso de Onboarding**
- Usuario navega por 15 slides
- Se recolectan datos de perfil y proyecto
- En el slide 9 se generan microtareas automáticamente

### **4. Activación del Persona**
- Slide 15: Pantalla de carga de 12 segundos
- Se procesan todos los datos recolectados

### **5. Creación de Entidades**
- **Proyecto** creado con toda la información
- **Microtareas** generadas y asignadas al proyecto
- **Entrada del diario** documentando el proceso
- **Perfil actualizado** con `onboarding_completed = true`

### **6. Acceso a la Aplicación**
- Usuario puede acceder al dashboard
- Ve su proyecto creado y microtareas listas
- Comienza su viaje de productividad

## 🔧 **Personalización y Extensión**

### **Agregar Nuevos Campos:**
1. Actualizar tipos en `src/types/onboarding.ts`
2. Agregar campos en `src/components/OnboardingForm.tsx`
3. Actualizar `src/services/onboardingService.ts`
4. Ejecutar script SQL para nuevos campos

### **Modificar el Flujo:**
1. Editar `src/data/onboardingData.ts`
2. Ajustar lógica en `src/components/OnboardingFlow.tsx`
3. Actualizar validaciones en `src/components/OnboardingForm.tsx`

### **Integrar con IA:**
1. Conectar `src/services/onboardingService.ts` con APIs de IA
2. Personalizar generación de microtareas
3. Implementar análisis de patrones de usuario

## 🧪 **Testing y Desarrollo**

### **Modo de Desarrollo:**
```bash
npm run dev
```

### **Build de Producción:**
```bash
npm run build
npm run preview
```

### **Linting:**
```bash
npm run lint
```

## 📝 **Notas de Desarrollo**

- **Estado del Onboarding:** Se almacena en `profiles.onboarding_completed`
- **Datos del Usuario:** Se guardan en `onboarding_data` para personalización futura
- **Proyecto Creado:** Se asigna automáticamente como proyecto activo
- **Microtareas:** Se generan basándose en el tipo y dificultad del proyecto
- **Diario:** Se crea una entrada inicial documentando el proceso

## 🤝 **Contribución**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🆘 **Soporte**

Para soporte técnico o preguntas sobre el sistema de onboarding:
- Crear un issue en GitHub
- Contactar al equipo de desarrollo
- Revisar la documentación de Supabase

---

**Deprocast** - Transformando la procrastinación en productividad, un microtask a la vez. 🚀

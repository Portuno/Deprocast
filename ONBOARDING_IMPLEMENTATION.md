# Sistema de Onboarding Completo - Deprocast

## Descripción

Este sistema implementa un flujo de onboarding completo de 12 slides que se ejecuta cuando un usuario está logueado pero no ha completado el proceso de onboarding (`onboarding_completed = false`).

## Componentes Implementados

### 1. Hook `useOnboarding`
- **Archivo:** `src/hooks/useOnboarding.ts`
- **Funcionalidad:** 
  - Verifica el estado del onboarding del usuario
  - Maneja la lógica de completar el onboarding
  - Almacena los datos recolectados del onboarding
  - Proporciona estados de loading y requerimiento de onboarding

### 2. Componente `OnboardingFlow`
- **Archivo:** `src/components/OnboardingFlow.tsx`
- **Funcionalidad:**
  - Maneja los 12 slides del onboarding
  - Navegación entre slides con botones de anterior/siguiente
  - Barra de progreso visual
  - Indicadores de navegación por puntos

### 3. Componente `OnboardingForm`
- **Archivo:** `src/components/OnboardingForm.tsx`
- **Funcionalidad:**
  - Formularios para slides de recolección de datos
  - Campos de selección para preferencias del usuario
  - Campo de texto para proyecto principal
  - Validación de formularios

### 4. Tipos y Datos
- **Archivo:** `src/types/onboarding.ts`
- **Archivo:** `src/data/onboardingData.ts`
- **Funcionalidad:**
  - Definición de tipos TypeScript para el onboarding
  - Datos de los 12 slides con contenido completo

### 5. Integración en `App.tsx`
- **Funcionalidad:**
  - Verifica si el onboarding es requerido antes de mostrar la aplicación
  - Muestra el flujo completo de onboarding si es necesario
  - Estado de loading mientras se verifica el estado del onboarding

## Flujo de Funcionamiento

1. **Usuario se loguea** → `useAuth` detecta la autenticación
2. **Verificación de onboarding** → `useOnboarding` verifica `onboarding_completed` en el perfil
3. **Si `onboarding_completed = false`** → Se muestra `OnboardingFlow` con 12 slides
4. **Usuario navega por los slides** → Recopila datos y aprende sobre la plataforma
5. **Usuario completa onboarding** → Se almacenan los datos y se actualiza `onboarding_completed = true`
6. **Si `onboarding_completed = true`** → Acceso directo a la aplicación

## Base de Datos

### Campos Requeridos
- **Tabla:** `profiles`
  - **Campo:** `onboarding_completed` (boolean, default: false)
  - **SQL:** Ver archivo `supabase/015_add_onboarding_completed_field.sql`

- **Tabla:** `onboarding_data`
  - **Campos:** `energy_level`, `distraction_susceptibility`, `imposter_syndrome`, `main_project`
  - **SQL:** Ver archivo `supabase/016_create_onboarding_data_table.sql`

## Uso

### Para Desarrolladores
```typescript
import { useOnboarding } from './hooks/useOnboarding';

const { isOnboardingRequired, isLoading, completeOnboarding } = useOnboarding();
```

### Para Usuarios
- El onboarding se ejecuta automáticamente después del login
- Es obligatorio completarlo para acceder a la plataforma
- Una vez completado, no se vuelve a mostrar

## Personalización Futura

El sistema está diseñado para ser fácilmente expandible:
- Agregar más slides al onboarding
- Modificar el contenido del modal
- Agregar validaciones adicionales
- Integrar con otros flujos de la aplicación

## Archivos de Base de Datos

Ejecutar en Supabase en este orden:
```sql
-- Archivo: 015_add_onboarding_completed_field.sql
-- Asegura que el campo onboarding_completed esté disponible

-- Archivo: 016_create_onboarding_data_table.sql
-- Crea la tabla para almacenar los datos del onboarding
```

## Características del Onboarding

### 12 Slides Implementados:
1. **Welcome** - Bienvenida y introducción
2. **Neuroscience** - Explicación científica de la procrastinación
3. **User Profile** - Recolección de patrones de trabajo
4. **Main Project** - Descripción del proyecto principal
5. **Micro-tasks** - Explicación del concepto
6. **Task Preview** - Vista previa de tareas generadas
7. **Pomodoro+ Protocol** - Explicación del protocolo
8. **Celebration** - Importancia de celebrar logros
9. **Growth Journal** - Propósito del diario de crecimiento
10. **AI Coach** - Explicación del coach personalizado
11. **Mindset** - Paciencia y persistencia
12. **Summary** - Finalización y primer paso

### Datos Recolectados:
- **energyLevel**: Patrón de energía del usuario
- **distractionSusceptibility**: Susceptibilidad a distracciones
- **imposterSyndrome**: Nivel de síndrome del impostor
- **mainProject**: Descripción del proyecto principal

import Ajv from 'ajv';
import addFormats from 'ajv-formats';

export const tripDataSchema = {
  type: 'object',
  properties: {
    trips: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          startDate: { type: 'string', format: 'date-time' },
          endDate: { type: 'string', format: 'date-time' },
          locations: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                address: { type: 'string' },
                coordinates: {
                  type: 'object',
                  properties: {
                    lat: { type: 'number' },
                    lng: { type: 'number' }
                  },
                  required: ['lat', 'lng'],
                  additionalProperties: false
                },
                businessHours: {
                  type: 'object',
                  patternProperties: {
                    '.*': { type: 'string' }
                  },
                  additionalProperties: false
                },
                notes: { type: 'string' },
                estimatedDuration: { type: 'number', minimum: 0 },
                visitTime: { type: 'string' }
              },
              required: ['id', 'name', 'address', 'coordinates'],
              additionalProperties: false
            }
          },
          isCompleted: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' }
        },
        required: ['id', 'title', 'description', 'startDate', 'endDate', 'locations', 'isCompleted', 'createdAt', 'updatedAt'],
        additionalProperties: false
      }
    },
    lastModified: { type: 'string', format: 'date-time' },
    version: { type: 'string' }
  },
  required: ['trips', 'lastModified', 'version'],
  additionalProperties: false
};

export class TripDataValidator {
  private ajv: Ajv;
  private validate: (data: unknown) => boolean;

  constructor() {
    this.ajv = new Ajv({ allErrors: true });
    addFormats(this.ajv);
    this.validate = this.ajv.compile(tripDataSchema);
  }

  validateTripData(data: unknown): { isValid: boolean; errors: Record<string, unknown>[] } {
    const isValid = this.validate(data);
    return {
      isValid,
      errors: this.validate.errors || []
    };
  }

  getFormattedErrors(errors: Record<string, unknown>[]): string[] {
    return errors.map((error: Record<string, unknown>) => {
      const path = (error.instancePath as string) || 'root';
      const message = (error.message as string) || 'Invalid data';
      return `${path}: ${message}`;
    });
  }
}

export const tripDataValidator = new TripDataValidator();
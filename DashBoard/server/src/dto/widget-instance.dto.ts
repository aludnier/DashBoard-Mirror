import { IsObject, IsString } from 'class-validator';

// Body of POST /users/:id/widget-instances. Only the shape is checked here;
// whether config matches the widget's params is checked in the domain.
export class CreateWidgetInstanceDto {
  @IsString()
  widgetDefinitionId: string;

  @IsObject()
  config: Record<string, unknown>;
}

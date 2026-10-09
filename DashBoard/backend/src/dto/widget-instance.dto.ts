import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { isIn, IsInt, IsObject, IsOptional, IsString } from 'class-validator';

// Body of POST /users/:id/widget-instances. Only the shape is checked here;
// whether config matches the widget's params is checked in the domain.
export class CreateWidgetInstanceDto {
  @ApiProperty()
  @IsString()
  widgetDefinitionId: string;

  @ApiProperty({description : "configuration of the widget such as limit of Ownership of data"})
  @IsObject()
  config: Record<string, unknown>;

  @ApiPropertyOptional({})
  @IsOptional()
  @IsInt()
  refreshRateSeconds?: number;
}

// Body of PATCH /users/:id/widget-instances/:instanceId.
export class UpdateWidgetInstanceDto {
  @ApiProperty()
  @IsInt()
  refreshRateSeconds: number;
  
  @ApiProperty()
  @IsInt()
  width: number;
  
  @ApiProperty()
  @IsInt()
  heigth: number;
  
  @ApiProperty()
  @IsInt()
  position : number;
  
}

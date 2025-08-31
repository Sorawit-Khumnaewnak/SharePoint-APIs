import { Body, Controller, Get, Header, Param, Post, Query, Res } from '@nestjs/common';
import { ApiBody, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GraphService } from './graph.service';
import { Response } from 'express';

class TokenDto { access_token!: string }

@ApiTags('graph')
@Controller('graph')
export class GraphController {
  constructor(private readonly graph: GraphService) {}

  // POST /graph/getList   { assertion }
  @Post('getList')
  @ApiBody({ schema: { properties: { access_token: { type: 'string' } }, required: ['access_token'] } })
  async getList(@Body() body: TokenDto): Promise<unknown> {
    return this.graph.listDrives(body.access_token);
  }

  // POST /graph/getSiteName?siteName=:siteName { access_token }
  @Post('getSiteName')
  @ApiQuery({ name: 'siteName', required: true })
  @ApiBody({ schema: { properties: { access_token: { type: 'string' } }, required: ['access_token'] } })
  async getSiteName(@Query('siteName') siteName: string, @Body() body: TokenDto): Promise<unknown> {
    return this.graph.getSiteByName(body.access_token, siteName);
  }

  // POST /graph/getSiteChildren?siteId=:siteId&driveName=:driveName { access_token }
  @Post('getSiteChildren')
  @ApiQuery({ name: 'siteId', required: true })
  @ApiQuery({ name: 'driveName', required: false })
  @ApiBody({ schema: { properties: { access_token: { type: 'string' } }, required: ['access_token'] } })
  async getSiteChildren(@Query('siteId') siteId: string, @Query('driveName') driveName: string | undefined, @Body() body: TokenDto): Promise<unknown> {
    return this.graph.getSiteChildren(body.access_token, siteId, driveName);
  }

  // POST /graph/getDriveChildren?driveId=:driveId&itemName=:itemName { access_token }
  @Post('getDriveChildren')
  @ApiQuery({ name: 'driveId', required: true })
  @ApiQuery({ name: 'itemName', required: false })
  @ApiBody({ schema: { properties: { access_token: { type: 'string' } }, required: ['access_token'] } })
  async getDriveChildren(@Query('driveId') driveId: string, @Query('itemName') itemName: string | undefined, @Body() body: TokenDto): Promise<unknown> {
    return this.graph.getDriveChildren(body.access_token, driveId, itemName);
  }

  // POST /graph/getDriveItemChildren?driveId=:driveId&itemId=:itemId&filter=:filter { access_token }
  @Post('getDriveItemChildren')
  @ApiQuery({ name: 'driveId', required: true })
  @ApiQuery({ name: 'itemId', required: true })
  @ApiQuery({ name: 'filter', required: false, description: "OData $filter expression (optional)" })
  @ApiBody({ schema: { properties: { access_token: { type: 'string' } }, required: ['access_token'] } })
  async getDriveItemChildren(@Query('driveId') driveId: string, @Query('itemId') itemId: string, @Query('filter') filter: string | undefined, @Body() body: TokenDto): Promise<unknown> {
    return this.graph.getDriveItemChildren(body.access_token, driveId, itemId, filter);
  }

  // POST /graph/downloadDriveItem/:driveId/:itemId { access_token }
  @Post('downloadDriveItem/:driveId/:itemId')
  @ApiBody({ schema: { properties: { access_token: { type: 'string' } }, required: ['access_token'] } })
  async downloadDriveItem(@Param('driveId') driveId: string, @Param('itemId') itemId: string, @Body() body: TokenDto, @Res() res: Response): Promise<void> {
    const result = await this.graph.downloadDriveItem(body.access_token, driveId, itemId);
    res.status(result.status);
    for (const [k, v] of Object.entries(result.headers)) {
      try { res.setHeader(k, v as any); } catch (_) {}
    }
    res.send(result.data);
  }
}



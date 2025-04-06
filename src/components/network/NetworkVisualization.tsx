'use client';

import React, { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import { NetworkNode, NetworkConnection, NeuralNetwork } from '@/types/network';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface NetworkVisualizationProps {
  network: NeuralNetwork;
  selectedNodeId: string | null;
  visualizationMode: 'standard' | 'domains' | 'levels' | 'connections';
  onNodeSelect: (nodeId: string | null) => void;
  width?: number;
  height?: number;
  className?: string;
}

export function NetworkVisualization({
  network,
  selectedNodeId,
  visualizationMode,
  onNodeSelect,
  width = 600,
  height = 500,
  className = ''
}: NetworkVisualizationProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [nodeDetails, setNodeDetails] = useState<NetworkNode | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  
  // Filter to only show unlocked nodes and their connections
  const unlockedNodes = network.nodes.filter(node => node.unlocked);
  const activeConnections = network.connections.filter(conn => {
    const sourceNode = unlockedNodes.find(n => n.id === conn.source);
    const targetNode = unlockedNodes.find(n => n.id === conn.target);
    return sourceNode && targetNode && conn.active;
  });
  
  // Create the visualization
  useEffect(() => {
    if (!svgRef.current || unlockedNodes.length === 0) return;
    
    // Clear previous visualization
    d3.select(svgRef.current).selectAll('*').remove();
    
    // Create SVG container
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .attr('style', 'max-width: 100%; height: auto;');
    
    // Create a group for the network
    const g = svg.append('g');
    
    // Create a simulation for force-directed layout
    const simulation = d3.forceSimulation(unlockedNodes as any)
      .force('link', d3.forceLink(activeConnections).id((d: any) => d.id)
        .distance(d => 100 - (d as any).strength * 50))
      .force('charge', d3.forceManyBody().strength(-50))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));
    
    // Add connections
    const links = g.selectAll('.link')
      .data(activeConnections)
      .enter()
      .append('line')
      .attr('class', 'network-link')
      .attr('stroke-width', d => 1 + d.strength * 4)
      .attr('stroke-opacity', d => 0.3 + d.strength * 0.7);
    
    // Style connections based on visualization mode
    if (visualizationMode === 'standard') {
      links.attr('stroke', '#88ccff');
    } else if (visualizationMode === 'connections') {
      links.attr('stroke', d => {
        const gradient = d.strength * 100;
        return `hsl(${200 + gradient}, 80%, 60%)`;
      });
    } else {
      links.attr('stroke', '#88ccff');
    }
    
    // Add nodes
    const nodes = g.selectAll('.node')
      .data(unlockedNodes)
      .enter()
      .append('g')
      .attr('class', 'network-node')
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);
    
    // Add node circles
    nodes.append('circle')
      .attr('r', d => 10 + d.level * 2)
      .attr('class', d => `node-circle ${d.id === selectedNodeId ? 'selected' : ''}`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        onNodeSelect(d.id === selectedNodeId ? null : d.id);
        setNodeDetails(d.id === selectedNodeId ? null : d);
      });
    
    // Style nodes based on visualization mode
    if (visualizationMode === 'standard') {
      nodes.select('circle')
        .attr('fill', d => getDomainColor(d.domain));
    } else if (visualizationMode === 'domains') {
      nodes.select('circle')
        .attr('fill', d => getDomainColor(d.domain));
    } else if (visualizationMode === 'levels') {
      nodes.select('circle')
        .attr('fill', d => {
          const hue = 200 + (d.level * 15);
          return `hsl(${hue}, 80%, 60%)`;
        });
    } else {
      nodes.select('circle')
        .attr('fill', '#88ccff');
    }
    
    // Add node labels
    nodes.append('text')
      .attr('dy', 4)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-label')
      .text(d => d.name.split(' ')[0]);
    
    // Add level indicators
    nodes.append('text')
      .attr('dy', -15)
      .attr('text-anchor', 'middle')
      .attr('class', 'node-level')
      .text(d => `Lv ${d.level}`);
    
    // Add progress rings
    nodes.append('circle')
      .attr('r', d => 10 + d.level * 2)
      .attr('class', 'progress-ring')
      .attr('stroke-dasharray', d => {
        const circumference = 2 * Math.PI * (10 + d.level * 2);
        return `${circumference * d.progress / 100} ${circumference}`;
      })
      .attr('stroke', d => {
        const hue = 120 + (d.progress * 1.2);
        return `hsl(${hue}, 80%, 60%)`;
      });
    
    // Update positions on simulation tick
    simulation.on('tick', () => {
      links
        .attr('x1', d => (d as any).source.x)
        .attr('y1', d => (d as any).source.y)
        .attr('x2', d => (d as any).target.x)
        .attr('y2', d => (d as any).target.y);
      
      nodes.attr('transform', d => `translate(${d.x},${d.y})`);
    });
    
    // Drag functions
    function dragstarted(event: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      event.subject.fx = event.subject.x;
      event.subject.fy = event.subject.y;
    }
    
    function dragged(event: any) {
      event.subject.fx = event.x;
      event.subject.fy = event.y;
    }
    
    function dragended(event: any) {
      if (!event.active) simulation.alphaTarget(0);
      event.subject.fx = null;
      event.subject.fy = null;
    }
    
    // Handle node hover
    const handleMouseOver = (event: any, d: any) => {
      if (!tooltipRef.current) {
        return;
      }
      tooltipRef.current.style.display = 'block';
      tooltipRef.current.style.left = `${event.pageX + 15}px`;
      tooltipRef.current.style.top = `${event.pageY - 28}px`;
      tooltipRef.current.innerHTML = `<strong>${d.name}</strong><br/>Domain: ${d.domain}<br/>Level: ${d.level}`;
    };

    const handleMouseOut = () => {
      if (!tooltipRef.current) {
        return;
      }
      tooltipRef.current.style.display = 'none';
    };

    // Draw links
    links
      .attr("cy", (d: any) => d.y)
      .attr("r", (d: any) => Math.sqrt(d.level || 1) * 5) 
      .attr("fill", (d: any) => domainColors[d.domain] || '#ccc')
      .attr("stroke", (d: any) => {
        if (d.id === selectedNodeId) {
           return '#fff';
        } else {
           return '#333';
        }
      })
      .attr("stroke-width", (d: any) => {
        if (d.id === selectedNodeId) {
          return 3;
        } else {
          return 1.5;
        }
      })
      .on('mouseover', handleMouseOver)
      .on('mouseout', handleMouseOut)
      .on('click', (event: any, d: any) => onNodeSelect(d.id));
    
    // Apply drag behavior
    nodes.call(d3.drag()
      .on('start', dragstarted)
      .on('drag', dragged)
      .on('end', dragended) as any);
    
    // Cleanup
    return () => {
      simulation.stop();
    };
  }, [unlockedNodes, activeConnections, width, height, selectedNodeId, visualizationMode, onNodeSelect]);
  
  // Get color for cognitive domain
  const getDomainColor = (domain: string) => {
    switch (domain) {
      case 'memory':
        return '#4a9df8'; // Blue
      case 'creativity':
        return '#f87c4a'; // Orange
      case 'logic':
        return '#4af8a7'; // Green
      case 'pattern':
        return '#c44af8'; // Purple
      case 'speed':
        return '#f8e54a'; // Yellow
      default:
        return '#88ccff'; // Default blue
    }
  };
  
  // Get domain name
  const getDomainName = (domain: string) => {
    switch (domain) {
      case 'memory':
        return 'Memory';
      case 'creativity':
        return 'Creativity';
      case 'logic':
        return 'Logic';
      case 'pattern':
        return 'Pattern Recognition';
      case 'speed':
        return 'Processing Speed';
      default:
        return domain;
    }
  };
  
  return (
    <div className={`network-visualization ${className}`}>
      <div className="visualization-controls mb-4 flex flex-wrap gap-2">
        <Button
          variant={visualizationMode === 'standard' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNodeSelect(null) || setNodeDetails(null)}
          className="flex-1"
        >
          Standard View
        </Button>
        <Button
          variant={visualizationMode === 'domains' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNodeSelect(null) || setNodeDetails(null)}
          className="flex-1"
        >
          Domains
        </Button>
        <Button
          variant={visualizationMode === 'levels' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNodeSelect(null) || setNodeDetails(null)}
          className="flex-1"
        >
          Levels
        </Button>
        <Button
          variant={visualizationMode === 'connections' ? 'default' : 'outline'}
          size="sm"
          onClick={() => onNodeSelect(null) || setNodeDetails(null)}
          className="flex-1"
        >
          Connections
        </Button>
      </div>
      
      <div className="visualization-container relative">
        <svg ref={svgRef} className="network-svg"></svg>
        
        {nodeDetails && (
          <Card className="node-details-card absolute top-0 right-0 w-64">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{nodeDetails.name}</CardTitle>
              <CardDescription>
                Level {nodeDetails.level} {getDomainName(nodeDetails.domain)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-2">{nodeDetails.description}</p>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${nodeDetails.progress}%` }}
                ></div>
                <span className="progress-text">{Math.round(nodeDetails.progress)}% to Level {nodeDetails.level + 1}</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
      
      <div className="network-legend mt-4 flex flex-wrap gap-4 justify-center">
        <div className="legend-item flex items-center">
          <div className="legend-color" style={{ backgroundColor: getDomainColor('memory') }}></div>
          <span>Memory</span>
        </div>
        <div className="legend-item flex items-center">
          <div className="legend-color" style={{ backgroundColor: getDomainColor('creativity') }}></div>
          <span>Creativity</span>
        </div>
        <div className="legend-item flex items-center">
          <div className="legend-color" style={{ backgroundColor: getDomainColor('logic') }}></div>
          <span>Logic</span>
        </div>
        <div className="legend-item flex items-center">
          <div className="legend-color" style={{ backgroundColor: getDomainColor('pattern') }}></div>
          <span>Pattern</span>
        </div>
        <div className="legend-item flex items-center">
          <div className="legend-color" style={{ backgroundColor: getDomainColor('speed') }}></div>
          <span>Speed</span>
        </div>
      </div>
    </div>
  );
}

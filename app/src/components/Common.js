import React from 'react';
import styled from 'styled-components/native';


export const Title = styled.Text`
    font-family: blenda;
    color: ${props => props.$dark ? 'black' : 'white'};
    font-size: 36px;
    margin: 10px;
    text-align: center;
`;

export const Span = styled.Text`
    font-family: fenix;
    color: ${props => props.$dark ? 'black' : 'white'};
    font-size: 18px;
`;
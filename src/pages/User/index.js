import React, {Component} from 'react';
import PropTypes from 'prop-types';

import {ActivityIndicator} from 'react-native';
import api from '../../services/api';

import {
  Container,
  Header,
  Avatar,
  Name,
  Bio,
  Stars,
  Starred,
  OwnerAvatar,
  Info,
  Title,
  Author,
} from './styles';

export default class User extends Component {
  static navigationOptions = ({navigation}) => ({
    title: navigation.getParam('user').name,
  });

  static propTypes = {
    navigation: PropTypes.shape({
      getParam: PropTypes.func,
      navigate: PropTypes.func,
    }).isRequired,
  };

  state = {
    stars: [],
    carregando: true,
    refreshing: false,
    nropg: 1,
  };

  async componentDidMount() {
    this.loadMore();
  }

  load = async (nropg = 1) => {
    const {navigation} = this.props;
    const {stars} = this.state;
    const user = navigation.getParam('user');

    const response = await api.get(`/users/${user.login}/starred`, {
      params: {nropg},
    });

    this.setState({
      stars: nropg >= 2 ? [...stars, ...response.data] : response.data,
      nropg,
      carregando: false,
      refreshing: false,
    });
  };

  loadMore = () => {
    const {nropg} = this.state;

    const nextPage = nropg + 1;

    this.load(nextPage);
  };

  refreshList = () => {
    this.setState({refreshing: true, stars: []}, this.load);
  };

  handleNavigate = repository => {
    const {navigation} = this.props;

    navigation.navigate('Repository', {repository});
  };

  render() {
    const {stars, carregando, refreshing} = this.state;
    const {navigation} = this.props;

    const user = navigation.getParam('user');

    return (
      <Container>
        <Header>
          <Avatar source={{uri: user.avatar}} />
          <Name>{user.name}</Name>
          <Bio>{user.bio}</Bio>
        </Header>
        {carregando ? (
          <ActivityIndicator color="#999" />
        ) : (
          <Stars
            data={stars}
            keyExtractor={star => String(star.id)}
            onRefresh={this.refreshList}
            refreshing={refreshing}
            onEndReachedThreshold={0.2}
            onEndReached={this.loadMore}
            renderItem={({item}) => (
              <Starred onPress={() => this.handleNavigate(item)}>
                <OwnerAvatar source={{uri: item.owner.avatar_url}} />
                <Info>
                  <Title>{item.name}</Title>
                  <Author>{item.owner.login}</Author>
                </Info>
              </Starred>
            )}
          />
        )}
      </Container>
    );
  }
}
